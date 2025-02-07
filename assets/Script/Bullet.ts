import { _decorator, Canvas, CCInteger, Collider2D, Component, Contact2DType, director, IPhysics2DContact, Node, UITransform, RigidBody2D, Vec2 } from 'cc';
const { ccclass, property } = _decorator;
import { Player } from './Player';
@ccclass('Bullet')
export class Bullet extends Component {
    @property({ type: Collider2D, tooltip: "子彈的碰撞器" })
    collider2D: Collider2D = null!;
    @property({ type: CCInteger, tooltip: "1代表單發，2代表雙發" })
    bulletType: number = 0;
    @property({ type: CCInteger, tooltip: "子彈" })
    speed: number = 500;//特殊子彈600，藍色的那顆
    @property({ type: Player, tooltip: "玩家" })
    player: Player = null!;
    onLoad() {
        this.player = director.getScene().getComponentInChildren(Player);  
        this.initBullet();
    }

    initBullet(){
        if (this.collider2D == null) {
            console.log("你沒放碰撞器");
            this.collider2D = this.node.getComponent(Collider2D);
        }
        this.collider2D.enabled = true;
        this.collider2D.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
        const rigidBody2D = this.node.getComponent(RigidBody2D);
        rigidBody2D.linearVelocity = new Vec2(0, -this.speed);
    }
    //先將移動做出來
    update(delta: number) {
        const position = this.node.worldPosition;
        this.node.setPosition(position.x, position.y + (this.speed * delta), position.z);

        //如果子彈超出螢幕，就回收
        if (position.y > director.getScene().getComponentInChildren(Canvas).getComponent(UITransform).height) {
            this.unuseBullet();
        }
    }

    onBeginContact(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
        this.unuseBullet()
    }

    unuseBullet() {
        this.player.unuseBullet(this.node, this.bulletType)
    }

    protected onDestroy(): void {
        this.collider2D.off(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
    }
}