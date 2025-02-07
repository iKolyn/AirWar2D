import { _decorator, Collider2D, Component, Contact2DType, PhysicsSystem2D, EPhysics2DDrawFlags, RigidBody2D, RigidBody } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('T1')
export class T1 extends Component {
    @property
    speed: number = 200;

    private collider: Collider2D | null = null;
    private rigidbody: RigidBody2D | null = null;

    protected onLoad(): void {
        // 啟用物理系統
        PhysicsSystem2D.instance.enable = true;

        // 獲取組件
        this.collider = this.getComponent(Collider2D);
        this.rigidbody = this.getComponent(RigidBody2D);

        // 檢查碰撞器是否存在
        if (this.collider) {
            // 啟用碰撞器
            this.collider.enabled = true;
            // 註冊碰撞事件監聽
            this.collider.on(Contact2DType.BEGIN_CONTACT, this.onCollision, this);
            console.log("碰撞器監聽已註冊");
        }

        // 檢查剛體是否存在
        if (this.rigidbody) {
            this.rigidbody.allowSleep = false;
            this.rigidbody.enabledContactListener = true;

            console.log("剛體設置完成");
        }
    }

    private onCollision(selfCollider: Collider2D, otherCollider: Collider2D): void {
        console.log("碰撞發生!", {
            self: selfCollider.node.name,
            other: otherCollider.node.name
        });
        this.node.destroy();
    }

    update(deltaTime: number) {
        // 往上移動
        const currentPos = this.node.position;
        const newY = currentPos.y + this.speed * deltaTime;
        this.node.setPosition(currentPos.x, newY, 0);
    }

    protected onDestroy(): void {
        if (this.collider) {
            this.collider.off(Contact2DType.BEGIN_CONTACT, this.onCollision, this);
        }
    }
}