import { _decorator, CCFloat, CCInteger, Color, color, Component, Node, Sprite, Tween, tween, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('BombEffect')
export class BombEffect extends Component {

    @property({ type: Vec3, tooltip: "目標縮放大小" })
    targetScale: Vec3 = new Vec3(3, 3, 3);
    @property({ type: CCFloat, tooltip: "爆炸效果的持續時間" })
    duration: number = 0.75;
    @property({ type: Color, tooltip: "爆炸效果的結束" })
    color: Color = new Color(255, 255, 255, 0);
    @property({ type: Sprite, tooltip: "爆炸圖片" })
    private sprite: Sprite;

    private tweenScaleAction: Tween | null = null;
    private tweenColorAction: Tween | null = null;

    initBombEffect() {
        if (this.sprite == null){
            this.sprite = this.node.getComponent(Sprite);
        }
        this.unuseBombEffect();

        this.tweenScaleAction = tween(this.node)//注意這邊的寫法，使用this.node而不是this.node.scale
            .to(this.duration, { scale: this.targetScale }, {
                easing: 'expoOut', onUpdate: (target: Node) => {
                    this.node = target;
                },
                onComplete: () => {
                    this.unuseBombEffect();
                }
            })
            .start();

        this.tweenColorAction = tween(this.sprite)
            .to(this.duration, { color: new Color(this.color.r, this.color.b, this.color.g, 0) },
                {
                    easing: "smooth", onUpdate: (target: Sprite) => {
                        this.sprite.color = target.color;
                    },
                    onComplete: () => {
                        this.unuseBombEffect();
                    }
                }).start();
    }

    unuseBombEffect() {
        if (this.tweenScaleAction)
            tween(this.node).stop();
        if (this.tweenColorAction)
            tween(this.sprite).stop();

        tween(this.node).removeSelf();
        tween(this.sprite).removeSelf();

        this.node.setScale(0.1, 0.1, 0.1)
        this.sprite.color = this.color;

        this.tweenScaleAction = null;
        this.tweenColorAction = null;
    }
}


