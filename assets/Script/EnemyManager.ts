import { _decorator, AudioClip, Canvas, CCFloat, CCInteger, Component, director, Enum, input, Input, instantiate, math, Node, NodePool, Pool, Prefab, UITransform, Vec2, view } from 'cc';
import { Enemy } from './Enemy';
import { GameManager } from './GameManager';
import { Player } from './Player';
import { BombEffect } from './BombEffect';
import { AudioMgr } from './AudioMgr';
const { ccclass, property } = _decorator;
//飛機的型別
//換成number的方式，利用 EnumType as Number或者Number(Enum);
enum EnemyType {
    Enemy0,
    Enemy1,
    Enemy2,
}

@ccclass('EnemyManager')
export class EnemyManager extends Component {
    static _instacne: EnemyManager = null!;
    public static getInstance() {
        return this._instacne ??= new EnemyManager();
    }

    //需要飛機生成的頻率
    //注意基本型別可以不用()，但是對象型別需要()
    @property({ type: [CCFloat], tooltip: "Enemy生成的頻率" })
    enemysSpawnRate: number[] = [];
    @property({ type: [Prefab], tooltip: "Enemy預製物們" })
    enemyPrefabs: Prefab[] = [];
    @property({ type: [CCInteger], tooltip: "敵人的最大數量" })
    enemysMaxCount: number[] = [];
    @property({ type: CCInteger, tooltip: "生成範圍" })
    spawnRange: number[] = [];

    @property({ type: Node, tooltip: "敵人的節點池" })
    private allEnemysPool: NodePool[] = [];
    @property({ type: [Node], tooltip: "敵人的節點數組" })
    private existEnemys: Node[] = [];

    @property({ type: Prefab, tooltip: "爆炸特效" })
    private bombPrefab: Prefab = null!;
    @property({ type: AudioClip, tooltip: "爆炸音效" })
    private bombAudio: AudioClip = null!;
    bombPrefabPool: NodePool = new NodePool();
    @property({ type: CCFloat, tooltip: "雙擊的指針" })
    private doubleClickInterval: number = 200;
    private lastClickTime: number = 0;

    protected onLoad(): void {
        // const canvas = director.getScene().getComponentInChildren(Canvas);
        // const viewSize = view.getDesignResolutionSize();
        // const visibleSize = view.getVisibleSize();
        // console.log("設計分辨率：" + viewSize);
        // console.log("實際可見分辨機：" +visibleSize);
        EnemyManager._instacne = this;
        for (let i: number = 0; i < this.enemyPrefabs.length; i++) {
            this.allEnemysPool[i] = new NodePool();
            for (let j: number = 0; j < this.enemysMaxCount[i]; j++) {
                this.allEnemysPool[i].put(instantiate(this.enemyPrefabs[i]));
            }
        }
        if (this.bombPrefab == null) {
            console.error("請放入爆炸特效");
        }
        for (let i = 0; i < 5; i++) {
            this.bombPrefabPool.put(instantiate(this.bombPrefab));
        }

        this.lastClickTime = 0;
        input.on(Input.EventType.TOUCH_START, this.onTouchStart, this);
    }
    protected start(): void {
        let n = this.enemyPrefabs.length;
        //計時器的訂閱
        for (let i = 0; i < n; i++) {
            //注意，使用箭頭函數才可以避免this指向不同、立即執行造成undefined、閉包問題。
            this.schedule(() => this.enemySpawn(i), this.enemysSpawnRate[i]);
        }
    }

    protected onDestroy(): void {
        //計時器的取消訂閱
        this.unscheduleAllCallbacks();
        input.off(Input.EventType.TOUCH_START, this.onTouchStart, this);
    }

    onTouchStart() {
        const currentTime = Date.now();
        if (currentTime - this.lastClickTime < this.doubleClickInterval) {
            this.onDoubleClick();
        }
        else this.lastClickTime = currentTime;
    }

    onDoubleClick() {
        if (GameManager.getInstance().isHaveBomb() === false) return;
        //要怎麼獲得敵人?首先在你創建敵人的時候，把這個敵人存在一個數組裡面。
        for (let enemy of this.existEnemys) {
            enemy.getComponent(Enemy).bekill();
        }
        this.initBombEffect();
        GameManager.getInstance().useBomb();
    }

    initBombEffect(){
        const bomb = this.bombPrefabPool.size() > 0
            ? this.bombPrefabPool.get()
            : instantiate(this.bombPrefab);
        const bombInitPos = director.getScene().getComponentInChildren(Player).node.getPosition();
        AudioMgr.inst.playOneShot(this.bombAudio, 3);
        bomb.setParent(this.node);
        bomb.setPosition(bombInitPos);
        bomb.getComponent(BombEffect).initBombEffect();
        this.scheduleOnce(() => {
            this.bombPrefabPool.put(bomb);
        },2.5)
    }

    enemySpawn(type: number) {
        //生成敵人，使用const明確定義這個值不會改變，是個好習慣。
        const enemy = this.allEnemysPool[type].size() > 0
            ? this.allEnemysPool[type].get()
            : instantiate(this.enemyPrefabs[type]);

        const enmyHeight = enemy.getComponent(UITransform).height;
        //生成的範圍。
        const px: number = math.randomRangeInt(-this.spawnRange[type], this.spawnRange[type]);
        const py: number = (view.getVisibleSize().height * 0.5) + enmyHeight;//乘法比除法快。
        enemy.setPosition(px, py, 0);
        //初始化敵人
        enemy.getComponent(Enemy).initEnemy();
        this.existEnemys.push(enemy);
        //丟入父節點
        enemy.setParent(this.node);
    }

    public enemyRecycle(enemy: Node, type: number) {
        //獲得要被回收的enemy的索引在哪一個位置
        const index = this.existEnemys.indexOf(enemy);
        //splice說明：從特定的位置刪除元素，並且刪除多少個。
        this.existEnemys.splice(index, 1);
        this.allEnemysPool[type].put(enemy);
        this.node.removeChild(enemy);
    }
}
