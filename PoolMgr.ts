import { _decorator, Asset, Component, director, error, instantiate, Node, Prefab, resources } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('PoolMgr')
export class PoolMgr {

    private constructor() { };
    public static ins: PoolMgr = new PoolMgr();

    private readonly resPathTag = "resPath";
    private map: Map<string, Array<Node>> = new Map();

    public async getNode(resPath: string): Promise<Node> {
        let node: Node;
        if (!this.map.has(resPath)) {
            this.map.set(resPath, []);
        }
        node = this.map.get(resPath).pop();
        if (!node) {
            resources.load(resPath, Prefab, (err, prefab: Prefab) => {
                if (err) {
                    console.error(`Debug TypeError>>> 资源${resPath}加载失败, ${err.message}`);
                } else {
                    node = instantiate(prefab);
                    director.getScene().addChild(node);
                }
            });
        }
        await new Promise((resolve) => {
            let count = 100;
            const handler = setInterval(() => {
                count--;
                if (node || count <= 0) {
                    clearInterval(handler);
                    resolve(node);
                }
            }, 10);
        });

        if (node) {
            node.active = true;
            node[this.resPathTag] = resPath;
        }

        return node;
    }

    public putNode(node: Node) {
        if (!node) { return; }
        let key = node[this.resPathTag] ? node[this.resPathTag] : node.name;
        if (!this.map.has(key)) {
            this.map.set(key, []);
        }
        this.map.get(key).push(node);
        node.active = false;
    }
}


