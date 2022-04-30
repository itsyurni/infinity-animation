


/**
 * Queue Engine Start 
 */

 class QueueEngine {
    constructor(){
        this.list = [];
        this.running = false;
    }
    addQueue(val = null){
        if(val != null){
            this.list.push(val)
            if(!this.running){
                this.nextQueue();
            }
        }else{
            return this.list;
        }
    }

    nextQueue(){
        this.running = true;
        if(this.list.length < 1){
            this.running = false;
            return;
        }
        this.list.shift()()
    }
    clear(){
        return this.list = []
    }
}
