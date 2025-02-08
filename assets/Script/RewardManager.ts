import { _decorator, CCInteger, Component, Node, NodePool, RigidBody, Prefab, instantiate, math, view, UITransform, Collider2D, AudioClip } from 'cc';
import { Reward } from './Reward';
import { AudioMgr } from './AudioMgr';
const { ccclass, property } = _decorator;


@ccclass('RewardManager')
export class RewardManager extends Component {
    @property({ type: [Prefab], tooltip: "獎勵預製物" })
    rewardPrefab: Prefab[] = [];
    @property({ type: [AudioClip], tooltip: "獎勵音效" })
    rewardAudio: AudioClip[] = [];
    @property({ type: CCInteger, tooltip: "最大生成數" })
    maxSpawnCount: number[] = [];
    @property({ type: [CCInteger], tooltip: "生成速度" })
    spawnRate: number[] = [];
    @property({ type: [CCInteger], tooltip: "生成範圍" })
    spawnRange: number[] = [];
    private rewardPool: NodePool[] = [];

    protected onLoad(): void {
        for (let i = 0; i < this.rewardPrefab.length; i++) {
            this.rewardPool[i] = new NodePool();
            for (let j = 0; j < this.maxSpawnCount[i]; j++) {
                const reward = instantiate(this.rewardPrefab[i]);
                this.rewardPool[i].put(reward);
            }
            this.schedule(() => this.initReward(i), this.spawnRate[i]);
        }
    }

    initReward(type: number) {
        const reward = this.rewardPool[type].size() > 0
            ? this.rewardPool[type].get()
            : instantiate(this.rewardPrefab[type]);
        reward.getComponent(Reward).initReward();
        reward.setParent(this.node);
        const randomPositionX = math.randomRangeInt(-this.spawnRange[type], this.spawnRange[type]);
        reward.setPosition(randomPositionX, view.getVisibleSize().height * 0.5 + reward.getComponent(UITransform).height, 0);
    }

    unuseReward(reward: Node, type: number) {
        AudioMgr.inst.playOneShot(this.rewardAudio[type],1);
        this.rewardPool[type].put(reward);
    }

    protected onDestroy(): void {
        this.unscheduleAllCallbacks();
    }

}    