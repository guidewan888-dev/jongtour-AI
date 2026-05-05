import React from "react";

const tree = {
  name:"TravelMore Co.", id:"AF-002", type:"Agent B2B", tier:"Platinum", rev:"฿620K",
  children:[
    { name:"PhuketDeals", id:"AF-005", type:"Sub-agent", tier:"Bronze", rev:"฿12K", override:"+1%", children:[
      { name:"PhuketBeach", id:"AF-010", type:"Sub-agent", tier:"—", rev:"฿3K", override:"+1%", children:[] },
    ]},
    { name:"ChiangMaiLocal", id:"AF-008", type:"Sub-agent", tier:"—", rev:"฿8K", override:"+1%", children:[] },
  ]
};

function TreeNode({ node, level=0 }:{ node:any, level?:number }) {
  return (
    <div style={{marginLeft:level*32}}>
      <div className={`flex items-center gap-3 p-3 rounded-xl mb-1.5 ${level===0?"bg-primary/10 border-2 border-primary/20":"bg-slate-50"}`}>
        <span className="text-xl">{level===0?"🏢":"🌳"}</span>
        <div className="flex-1"><div className="font-bold text-sm">{node.name} <span className="text-xs text-slate-400 font-mono">({node.id})</span></div><div className="text-xs text-slate-500">{node.type} · {node.tier}{node.override?` · Override: ${node.override}`:""}</div></div>
        <div className="text-right"><div className="text-sm font-bold text-primary">{node.rev}</div></div>
      </div>
      {node.children?.map((c:any)=><TreeNode key={c.id} node={c} level={level+1}/>)}
    </div>
  );
}

export default function SubAgentTreePage() {
  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-slate-900">🌳 Sub-agent Hierarchy</h1><p className="text-sm text-slate-500 mt-1">Max 2 levels — override commission +1-2%</p></div>
      <div className="g-card p-5"><TreeNode node={tree}/></div>
      <div className="bg-blue-50 p-3 rounded-xl text-sm text-blue-800">💡 Sub-agent commission = parent's rate + override bonus (max 2 levels deep)</div>
    </div>
  );
}
