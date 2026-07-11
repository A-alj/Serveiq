"use client";
import { useMemo, useState } from "react";

type Product={id:string;name:string;price:number;category:string};
type CartItem=Product&{qty:number};

const products:Product[]=[
{id:"1",name:"مجبوس اللحم",price:6,category:"الأطباق"},
{id:"2",name:"مجبوس الدجاج",price:2.5,category:"الأطباق"},
{id:"3",name:"هريسة حساوية",price:1.5,category:"الأطباق"},
{id:"4",name:"جريش",price:1.5,category:"الأطباق"},
{id:"5",name:"كولا زيرو",price:.15,category:"المشروبات"},
{id:"6",name:"ليمون",price:.15,category:"المشروبات"},
{id:"7",name:"ماء",price:.15,category:"المشروبات"}];

export default function Home(){
 const [view,setView]=useState<"dashboard"|"pos">("dashboard");
 const [cart,setCart]=useState<CartItem[]>([]);
 const total=useMemo(()=>cart.reduce((s,x)=>s+x.price*x.qty,0),[cart]);
 function add(p:Product){setCart(c=>{const e=c.find(x=>x.id===p.id);return e?c.map(x=>x.id===p.id?{...x,qty:x.qty+1}:x):[...c,{...p,qty:1}]})}
 return <div className="shell">
  <aside className="sidebar"><div className="brand">ServeIQ</div><div style={{color:"#9ca3af"}}>حمسة مجالس</div>
   <nav className="nav"><button className={view==="dashboard"?"active":""} onClick={()=>setView("dashboard")}>الرئيسية</button>
   <button className={view==="pos"?"active":""} onClick={()=>setView("pos")}>الكاشير POS</button>
   <button>المطبخ KDS</button><button>المخزون</button><button>الموظفون</button><button>التقارير</button></nav>
  </aside>
  <main className="main">
   {view==="dashboard"?<>
    <div className="header"><div><h1>لوحة التحكم</h1><div className="muted">أداء حمسة مجالس اليوم</div></div><strong>فرع واحد</strong></div>
    <section className="grid cards">
     <div className="card"><div className="muted">مبيعات اليوم</div><div className="value">0.000 د.ك</div></div>
     <div className="card"><div className="muted">عدد الطلبات</div><div className="value">0</div></div>
     <div className="card"><div className="muted">طلبات بالمطبخ</div><div className="value">0</div></div>
     <div className="card"><div className="muted">الموظفون حاضرون</div><div className="value">0</div></div>
    </section>
    <section className="grid two" style={{marginTop:16}}>
     <div className="card"><h2>ServeIQ Copilot</h2><p>ابدأ بإدخال أول طلب من شاشة الكاشير.</p></div>
     <div className="card"><h2>التنبيهات</h2><p className="muted">المخزون، الإقامات، الصيانة، والتأخير.</p></div>
    </section>
   </>:<>
    <div className="header"><div><h1>الكاشير POS</h1><div className="muted">اختر الأصناف ثم أرسل الطلب للمطبخ</div></div><button onClick={()=>setCart([])}>مسح الطلب</button></div>
    <section className="grid two">
     <div className="grid products">{products.map(p=><button key={p.id} className="product" onClick={()=>add(p)}>
      <div className="muted">{p.category}</div><h3>{p.name}</h3><div className="price">{p.price.toFixed(3)} د.ك</div></button>)}</div>
     <div className="card"><h2>الطلب الحالي</h2>{cart.length===0&&<p className="muted">لم تتم إضافة أصناف.</p>}
      {cart.map(x=><div className="order-line" key={x.id}><span>{x.name} × {x.qty}</span><strong>{(x.price*x.qty).toFixed(3)}</strong></div>)}
      <div className="total">الإجمالي: {total.toFixed(3)} د.ك</div><button className="primary" disabled={!cart.length}>تأكيد وإرسال للمطبخ</button>
     </div>
    </section>
   </>}
  </main>
 </div>
}
