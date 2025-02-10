import { _decorator, Canvas, CCFloat, Component, director, Node, UITransform } from 'cc';
const { ccclass, property } = _decorator;

//用於滾動背景的腳本
@ccclass('Bg')
export class Bg extends Component {

    @property({ type: Node, tooltip: "背景1" })
    bgs: Node[] = [];//如果要存數組，要先給這個數組一個空值

    @property({ type: CCFloat, tooltip: "背景滾動速度" })
    speed: number = 100;

    private spawnY: number = 0;//出生點
    private bottomY: number = 0;//銷毀點
    private bgHeight: number = 0;//背景高度
    private canvasHeight: number = 0;//畫布高度
    protected start(): void {
        window.addEventListener("resize", this.onResize.bind(this));
        this.onResize();
    }

    update(deltaTime: number) {
        let canvasHeight = director.getScene().getComponentInChildren(Canvas).getComponent(UITransform).height;

        for (let bg of this.bgs) {
            let dy: number = bg.position.y - this.speed * deltaTime;
            if (dy < this.bottomY) {
                dy += this.spawnY;
            }
            bg.setPosition(bg.position.x, dy, bg.position.z)
        }
    }
    onResize() {
        this.canvasHeight = director.getScene().getComponentInChildren(Canvas).getComponent(UITransform).height;
        this.bgHeight = this.bgs[0].getComponent(UITransform).height;
        this.spawnY = (this.bgHeight * 3) + this.canvasHeight;
        this.bottomY = -this.bgHeight * 2;
    }

    protected onDestroy(): void {
        window.removeEventListener("resize", this.onResize.bind(this));
    }
}


