/**
 * Système de queue pour l'envoi de messages avec rate limiting
 * Respecte les limites de Telegram : 30 messages/seconde max
 */

class MessageQueue {
  constructor(bot) {
    this.bot = bot;
    this.queue = [];
    this.isProcessing = false;
    this.messagesSentLastSecond = 0;
    this.lastResetTime = Date.now();
    this.failedAttempts = new Map(); // Track failed attempts per user
    
    // Configuration du rate limiting
    this.config = {
      maxMessagesPerSecond: 25, // On reste sous la limite de 30/sec
      delayBetweenMessages: 50, // 50ms entre chaque message (20 messages/sec max)
      maxRetries: 3,
      retryDelay: 5000, // 5 secondes avant retry
      backoffMultiplier: 2, // Délai doublé à chaque retry
      resetInterval: 1000, // Reset counter chaque seconde
      batchSize: 20, // Traiter par batch de 20 messages
      pauseAfterBatch: 2000 // Pause de 2 secondes entre les batchs
    };
    
    // Stats pour monitoring
    this.stats = {
      totalSent: 0,
      totalFailed: 0,
      totalQueued: 0,
      startTime: Date.now()
    };
    
    // Reset le compteur chaque seconde
    setInterval(() => {
      this.messagesSentLastSecond = 0;
      this.lastResetTime = Date.now();
    }, this.config.resetInterval);
  }
  
  /**
   * Ajoute un message à la queue
   */
  async addMessage(chatId, message, options = {}) {
    const messageItem = {
      chatId,
      message,
      options,
      retries: 0,
      addedAt: Date.now(),
      priority: options.priority || 0
    };
    
    this.queue.push(messageItem);
    this.stats.totalQueued++;
    
    // Trier par priorité (messages prioritaires en premier)
    this.queue.sort((a, b) => b.priority - a.priority);
    
    // Démarrer le traitement si pas déjà en cours
    if (!this.isProcessing) {
      this.processQueue();
    }
    
    return true;
  }
  
  /**
   * Ajoute plusieurs messages en batch
   */
  async addBatch(messages) {
    for (const msg of messages) {
      await this.addMessage(msg.chatId, msg.message, msg.options);
    }
    return messages.length;
  }
  
  /**
   * Traite la queue de messages
   */
  async processQueue() {
    if (this.isProcessing || this.queue.length === 0) {
      return;
    }
    
    this.isProcessing = true;
    
    try {
      while (this.queue.length > 0) {
        // Vérifier si on a atteint la limite par seconde
        if (this.messagesSentLastSecond >= this.config.maxMessagesPerSecond) {
          // Attendre jusqu'à la prochaine seconde
          const waitTime = this.config.resetInterval - (Date.now() - this.lastResetTime);
          if (waitTime > 0) {
            await this.sleep(waitTime);
          }
          continue;
        }
        
        // Traiter un batch de messages
        const batch = this.queue.splice(0, Math.min(
          this.config.batchSize,
          this.config.maxMessagesPerSecond - this.messagesSentLastSecond
        ));
        
        for (const messageItem of batch) {
          await this.sendMessage(messageItem);
          
          // Délai entre chaque message
          await this.sleep(this.config.delayBetweenMessages);
          
          // Vérifier à nouveau la limite
          if (this.messagesSentLastSecond >= this.config.maxMessagesPerSecond) {
            break;
          }
        }
        
        // Pause après chaque batch
        if (this.queue.length > 0) {
          await this.sleep(this.config.pauseAfterBatch);
        }
      }
    } finally {
      this.isProcessing = false;
    }
  }
  
  /**
   * Envoie un message avec gestion des erreurs
   */
  async sendMessage(messageItem) {
    const { chatId, message, options, retries } = messageItem;
    
    try {
      // Envoyer le message
      await this.bot.sendMessage(chatId, message, {
        parse_mode: 'HTML',
        disable_web_page_preview: true,
        ...options
      });
      
      this.messagesSentLastSecond++;
      this.stats.totalSent++;
      
      // Réinitialiser les échecs pour cet utilisateur
      this.failedAttempts.delete(chatId);
      
      console.log(`✅ Message envoyé à ${chatId} (${this.stats.totalSent}/${this.stats.totalQueued})`);
      
    } catch (error) {
      this.stats.totalFailed++;
      
      // Analyser l'erreur
      const errorCode = error.response?.body?.error_code;
      const errorDescription = error.response?.body?.description || error.message;
      
      console.error(`❌ Erreur envoi à ${chatId}: ${errorDescription}`);
      
      // Gestion spécifique des erreurs
      if (errorCode === 429) {
        // Too Many Requests - Rate limit atteint
        const retryAfter = error.response?.body?.parameters?.retry_after || 60;
        console.log(`⚠️ Rate limit atteint. Pause de ${retryAfter} secondes...`);
        
        // Remettre le message en queue avec priorité haute
        messageItem.priority = 10;
        this.queue.unshift(messageItem);
        
        // Pause forcée
        await this.sleep(retryAfter * 1000);
        
      } else if (errorCode === 403) {
        // Forbidden - L'utilisateur a bloqué le bot
        console.log(`🚫 Utilisateur ${chatId} a bloqué le bot`);
        // Ne pas réessayer
        
      } else if (errorCode === 400 && errorDescription?.includes('chat not found')) {
        // Chat non trouvé
        console.log(`❓ Chat ${chatId} non trouvé`);
        // Ne pas réessayer
        
      } else if (retries < this.config.maxRetries) {
        // Autre erreur - Réessayer avec backoff
        const delay = this.config.retryDelay * Math.pow(this.config.backoffMultiplier, retries);
        console.log(`🔄 Retry ${retries + 1}/${this.config.maxRetries} pour ${chatId} dans ${delay}ms`);
        
        messageItem.retries = retries + 1;
        
        // Attendre avant de remettre en queue
        setTimeout(() => {
          this.queue.push(messageItem);
          if (!this.isProcessing) {
            this.processQueue();
          }
        }, delay);
        
      } else {
        console.log(`❌ Échec définitif pour ${chatId} après ${this.config.maxRetries} tentatives`);
      }
    }
  }
  
  /**
   * Fonction helper pour sleep
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  /**
   * Obtenir les statistiques
   */
  getStats() {
    const runtime = Date.now() - this.stats.startTime;
    const messagesPerMinute = (this.stats.totalSent / (runtime / 60000)).toFixed(2);
    
    return {
      ...this.stats,
      queueLength: this.queue.length,
      isProcessing: this.isProcessing,
      runtime: Math.floor(runtime / 1000),
      messagesPerMinute,
      successRate: this.stats.totalQueued > 0 
        ? ((this.stats.totalSent / this.stats.totalQueued) * 100).toFixed(2) + '%'
        : '0%'
    };
  }
  
  /**
   * Vider la queue
   */
  clearQueue() {
    const cleared = this.queue.length;
    this.queue = [];
    return cleared;
  }
  
  /**
   * Arrêter le traitement
   */
  stop() {
    this.isProcessing = false;
    return this.clearQueue();
  }
}

module.exports = MessageQueue;