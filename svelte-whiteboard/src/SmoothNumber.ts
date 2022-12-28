

export default class SmoothNumber{
    private currentValue: number;
    private targetValue: number;

    private isAnimating: boolean = false;
    private lastTime;

    private changePerSec: number;
    public ChangeCallback: ((v: number) => void) | null = null;
    
    public set ChangePerSec(value: number){
        this.changePerSec = value;
    }

    public set ChangeTimeFixed(value: number){
        this.changePerSec = Math.abs((1 / value) * (this.currentValue  - this.targetValue));
    }

    public get(){
        return this.currentValue;
    }

    public set(val: number){
        this.targetValue = val;
        if(!this.isAnimating){
            this.isAnimating = true;
            this.lastTime = null;
            window.requestAnimationFrame(this.animate.bind(this))
        }
    }

    private animate(currentTime){
        if(this.lastTime){
            const deltaT = currentTime - this.lastTime;
            const deltaV = deltaT * (this.changePerSec / 1000);
            const dir = this.targetValue < this.currentValue ? -1 : 1; 
        
            if(deltaV > dir * (this.targetValue - this.currentValue)) this.currentValue = this.targetValue;
            else this.currentValue += deltaV * dir;

            if(this.ChangeCallback != null) this.ChangeCallback(this.currentValue);
        }

        this.lastTime = currentTime;
        if(this.targetValue == this.currentValue){
            this.isAnimating = false;
        }else{
            window.requestAnimationFrame(this.animate.bind(this));
        }
    }
 
    
    constructor(value, change, mode=true, changeCallback = null){
        this.currentValue = value;
        if(mode){
            this.ChangeTimeFixed = change;
        }else{
            this.changePerSec = change;
        }
        this.ChangeCallback = changeCallback
    }
}