import { _decorator, Canvas, CCFloat, CCInteger, Component, director, Enum, instantiate, math, Node, NodePool, Pool, Prefab, UITransform, Vec2, view } from 'cc';
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

    @property({ type: Node, tooltip: "敵人的節點池"})
    private allEnemysPool: NodePool[] = [];

    protected onLoad(): void {
        // const canvas = director.getScene().getComponentInChildren(Canvas);
        // const viewSize = view.getDesignResolutionSize();
        // const visibleSize = view.getVisibleSize();
        // console.log("設計分辨率：" + viewSize);
        // console.log("實際可見分辨機：" +visibleSize);
        for (let i: number = 0; i < this.enemyPrefabs.length; i++) {
            this.allEnemysPool[i] = new NodePool();
            for (let j: number = 0; j < this.enemysMaxCount[i]; j++) {
                this.allEnemysPool[i].put(instantiate(this.enemyPrefabs[i]));
            }
        }
    }
    protected start(): void {
        let n = this.enemyPrefabs.length - 1;
        //計時器的訂閱
        for (let i = n; i > 0; i--) {
            //注意，使用箭頭函數才可以避免this指向不同、立即執行造成undefined、閉包問題。
            this.schedule(() => this.enemySpawn(i), this.enemysSpawnRate[i]);
        }
    }
    protected onDestroy(): void {
        //計時器的取消訂閱
        this.unscheduleAllCallbacks();
    }

    enemySpawn(type: number) {
        //生成敵人，使用const明確定義這個值不會改變，是個好習慣。
        const enemy = this.allEnemysPool[type].size() > 0
            ? this.allEnemysPool[type].get()
            : instantiate(this.enemyPrefabs[type]);

        const enmyHeight = enemy.getComponent(UITransform).height;
        //丟入父節點
        this.node.addChild(enemy);
        //生成的範圍。
        const px: number = math.randomRangeInt(-this.spawnRange[type], this.spawnRange[type]);
        const py: number = (view.getVisibleSize().height * 0.5) + enmyHeight;//乘法比除法快。
        enemy.setPosition(px, py, 0);
    }

}


