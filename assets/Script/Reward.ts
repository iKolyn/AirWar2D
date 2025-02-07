import { _decorator, CCFloat, CCInteger, Collider2D, Component, Contact2DType, Node, RigidBody, UI, UITransform, view } from 'cc';
import { RewardManager } from './RewardManager';
const { ccclass, property } = _decorator;

//注意這邊的用法，跟C#的public不同，要export導出才可以被其他人使用。
export enum RewardType {
    TwoShoot,
    Bomb
}

@ccclass('Reward')
export class Reward extends Component {
    @property({ type: RewardManager, tooltip: "獎勵管理員" })
    rewardManager: RewardManager = null!;
    @property({ type: Collider2D, tooltip: "碰撞器" })
    collider2D: Collider2D = null!;
    @property({ type: CCInteger, tooltip: "獎勵種類" })
    rewardType: RewardType = RewardType.TwoShoot;
    @property({ type: CCInteger, tooltip: "移動速度" })
    speed: number = 300;
    @property({ type: CCFloat, tooltip: "左右搖擺的幅度" })
    swingAmount: number = 100;
    @property({ type: CCFloat, tooltip: "搖擺速度" })
    swingSpeed: number = 2;
    canvasHeight: number = 0;
    private elapsedTime: number = 0;

    onLoad() {
        this.canvasHeight = view.getVisibleSize().height * 0.5;
        this.rewardManager = this.node.parent.getComponent(RewardManager);
        this.initReward();
    }
    initReward() {
        if (this.collider2D == null) {
            this.collider2D = this.node.getComponent(Collider2D);
        }
        this.collider2D.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
    }

    onBeginContact(selfCollider: Collider2D, otherCollider: Collider2D) {
        this.rewardManager.unuseReward(this.node, this.rewardType);
    }

    //從上到下的移動
    update(deltaTime: number) {
        this.elapsedTime += deltaTime;
        const horizontalOffset = Math.sin(this.elapsedTime * this.swingSpeed) * this.swingAmount;
        const verticalOffset = ((Math.sin(this.elapsedTime + 1000) + 2) * 0.5) * this.speed;
        const p = this.node.position;

        this.node.setRotationFromEuler(0, 0, horizontalOffset * 0.2);
        this.node.setPosition(
            p.x + horizontalOffset * deltaTime,
            p.y - verticalOffset * deltaTime,
            p.z
        );

        if (p.y < -this.node.getComponent(UITransform).height * 0.5 - this.canvasHeight) {
            this.rewardManager.unuseReward(this.node, this.rewardType);
        }
    }

    protected onDestroy(): void {
        this.collider2D.off(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
    }
}


