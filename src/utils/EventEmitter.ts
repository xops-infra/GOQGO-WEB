// Browser-compatible EventEmitter implementation
export class EventEmitter {
  private events: { [key: string]: Function[] } = {}

  on(event: string, listener: Function): this {
    if (!this.events[event]) {
      this.events[event] = []
    }
    this.events[event].push(listener)
    return this
  }

  off(event: string, listener: Function): this {
    if (!this.events[event]) return this
    
    const index = this.events[event].indexOf(listener)
    if (index > -1) {
      this.events[event].splice(index, 1)
    }
    return this
  }

  emit(event: string, ...args: any[]): boolean {
    if (!this.events[event]) return false
    
    this.events[event].forEach(listener => {
      try {
        listener.apply(this, args)
      } catch (error) {
        console.error('Event listener error:', error)
      }
    })
    
    return true
  }

  removeAllListeners(event?: string): this {
    if (event) {
      delete this.events[event]
    } else {
      this.events = {}
    }
    return this
  }

  listenerCount(event: string): number {
    return this.events[event] ? this.events[event].length : 0
  }

  eventNames(): string[] {
    return Object.keys(this.events)
  }
}
