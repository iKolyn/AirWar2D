import { _decorator, CCInteger, Component, EventTouch, Input, input, instantiate, math, Node, NodePool, Prefab, Vec3, } from 'cc';
const { ccclass, property } = _decorator;

//發射子彈的類型。
enum ShootType {
    OneShoot,
    TwoShoot,
};

@ccclass('Player')
export class Player extends Component {
    @property({ type: CCInteger, tooltip: "子彈池最大數量" })
    bulletMaxCount: number = 20;
    bullet1Pool: NodePool = new NodePool();//子彈池1
    bullet2Pool: NodePool = new NodePool();//子彈池2
    @property({ type: Node, tooltip: "子彈父節點" })
    bulletParent: Node = null!;
    @property({ type: Prefab, tooltip: "子彈1預製物" })
    bullet1Prefab: Prefab = null!;
    @property({ type: Prefab, tooltip: "子彈2預製物" })
    bullet2Prefab: Prefab = null!;
    @property({ type: Node, tooltip: "子彈發射點們" })
    bulletShootPoint: Node[] = [];


    //預設的子彈射擊型態是單發射擊
    @property({type:ShootType, tooltip: "子彈射擊型態"})
    shootType: ShootType = ShootType.OneShoot;
    @property({ type: Number, tooltip: "子彈發射頻率" })
    shootRate: number = 0.5;
    shootTimer: number = 0;//計時器;



    protected onLoad(): void {
        for (let i = 0; i < this.bulletMaxCount; i++) {
            let bullet1 = instantiate(this.bullet1Prefab);
            this.bullet1Pool.put(bullet1);
        }
        for (let i = 0; i < this.bulletMaxCount * 2; i++) {
            let bullet2 = instantiate(this.bullet2Prefab);
            this.bullet2Pool.put(bullet2);
        }
        input.on(Input.EventType.TOUCH_MOVE, this.onTouchMove, this);
    }
    onTouchMove(event: EventTouch) {
        const p = this.node.position;
        //允許飛機一部分可以移出螢幕，但是不能完全移出螢幕
        const targetPosition = new Vec3(
            math.clamp(p.x + event.getDeltaX(), -230, 230),
            math.clamp(p.y + event.getDeltaY(), -380, 380),
            p.z);

        this.node.setPosition(targetPosition);

    }
    update(deltaTime: number) {
        switch (this.shootType) {
            case ShootType.OneShoot:
                this.useBullet1(deltaTime);
                break;
            case ShootType.TwoShoot:
                this.useBullet2(deltaTime);
                break;
        }
    }

    //間隔一段時間就會自動發射子彈，同時也要發射頻率。
    useBullet1(dt: number) {
        this.shootTimer += dt;
        //時間到了就發射子彈
        if (this.shootTimer >= this.shootRate) {
            this.shootTimer = 0;

            const bullet = this.bullet1Pool.size() > 0 ?
                this.bullet1Pool.get() : instantiate(this.bullet1Prefab);

            this.bulletParent.addChild(bullet);
            //注意要使用世界座標
            bullet.setWorldPosition(this.bulletShootPoint[0].worldPosition);
        }

    }
    useBullet2(dt: number) {
        this.shootTimer += dt;

        if (this.shootTimer >= this.shootRate) {
            this.shootTimer = 0;

            // Create bullets for positions 1 and 2
            for (let i = 1; i <= 2; i++) {
                const bullet = this.bullet2Pool.size() > 0
                    ? this.bullet2Pool.get()
                    : instantiate(this.bullet2Prefab);
                this.bulletParent.addChild(bullet);
                bullet.setWorldPosition(this.bulletShootPoint[i].worldPosition);
            }
        }
    }
    public unuseBullet(bullet: Node, type: number) {
        if(type == 0)
            this.bullet1Pool.put(bullet);
        else
            this.bullet2Pool.put(bullet);
    }
}

