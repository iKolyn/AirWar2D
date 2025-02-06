import { _decorator, CCInteger, Component, EventTouch, Input, input, instantiate, math, Node, NodePool, Prefab, Vec3, } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Player')
export class Player extends Component {
    @property({type:CCInteger, tooltip: "子彈池最大數量"})
    bulletMaxCount:number = 20;
    bullet1Pool:NodePool = new NodePool();//子彈池
    @property({type:Node, tooltip: "子彈父節點"})
    bulletParent:Node = null!;
    @property({type:Node, tooltip: "子彈發射點"})
    bulletShootPoint:Node = null!;

    @property({type:Number, tooltip: "子彈發射頻率"})
    shootRate:number = 0.5;
    @property({type:Prefab, tooltip: "子彈節點"})
    bullet1Prefab:Prefab = null!;
    shootTimer:number = 0;//計時器;

    

    protected onLoad(): void {
        for(let i = 0; i < this.bulletMaxCount; i++){
            let bullet1 = instantiate(this.bullet1Prefab);
            this.bullet1Pool.put(bullet1);
        }
        input.on(Input.EventType.TOUCH_MOVE, this.onTouchMove, this);
    }
    onTouchMove(event: EventTouch) {
        const p = this.node.position;
        //允許飛機一部分可以移出螢幕，但是不能完全移出螢幕
        const targetPosition = new Vec3(
            math.clamp(p.x + event.getDeltaX(),-230,230), 
            math.clamp(p.y + event.getDeltaY(),-380,380), 
            p.z);
        
        this.node.setPosition(targetPosition);

    }
    update(deltaTime:number){
        //間隔一段時間就會自動發射子彈，同時也要發射頻率。
        this.shootTimer += deltaTime;
        //時間到了就發射子彈
        if(this.shootTimer >= this.shootRate){
            this.shootTimer = 0;
            this.useBullet();
        }
    }
    useBullet(){
        let bullet;
        if(this.bullet1Pool.size() > 0){
            bullet = this.bullet1Pool.get();
        } else bullet = instantiate(this.bullet1Prefab);
        this.bulletParent.addChild(bullet);
        //注意要使用世界座標
        bullet.setWorldPosition(this.bulletShootPoint.worldPosition);
    }
}


