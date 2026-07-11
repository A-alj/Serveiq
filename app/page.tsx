"use client";

import { useEffect, useMemo, useState } from "react";

type View = "dashboard" | "pos" | "kds" | "orders";
type Status = "NEW" | "PREPARING" | "READY" | "COMPLETED";
type Payment = "KNET" | "CASH" | "VISA";
type Product = { id: string; name: string; price: number; category: string };
type CartItem = Product & { qty: number; note?: string };
type Order = { id: string; no: number; createdAt: string; items: CartItem[]; total: number; payment: Payment; status: Status; note?: string };

const PRODUCTS: Product[] = [
  { id: "meat", name: "مجبوس اللحم", price: 6, category: "الأطباق" },
  { id: "chicken", name: "مجبوس الدجاج", price: 2.5, category: "الأطباق" },
  { id: "harees", name: "هريسة حساوية", price: 1.5, category: "الأطباق" },
  { id: "jareesh", name: "جريش", price: 1.5, category: "الأطباق" },
  { id: "cola", name: "كولا زيرو", price: .15, category: "المشروبات" },
  { id: "lemon", name: "ليمون", price: .15, category: "المشروبات" },
  { id: "water", name: "ماء", price: .15, category: "المشروبات" }
];

const statusLabel: Record<Status, string> = { NEW: "جديد", PREPARING: "قيد التحضير", READY: "جاهز", COMPLETED: "تم التسليم" };

export default function Home() {
  const [view, setView] = useState<View>("dashboard");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [payment, setPayment] = useState<Payment>("KNET");
  const [orderNote, setOrderNote] = useState("");
  const [toast, setToast] = useState("");
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("serveiq-orders-v03");
      if (saved) setOrders(JSON.parse(saved));
    } catch {
      setSubmitError("تعذر قراءة الطلبات المحفوظة على هذا الجهاز.");
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("serveiq-orders-v03", JSON.stringify(orders));
    } catch {
      setSubmitError("تعذر حفظ الطلب على هذا الجهاز.");
    }
  }, [orders]);

  const total = useMemo(() => cart.reduce((s, x) => s + x.price * x.qty, 0), [cart]);
  const sales = useMemo(() => orders.filter(o => o.status === "COMPLETED").reduce((s, o) => s + o.total, 0), [orders]);
  const kitchenCount = orders.filter(o => o.status !== "COMPLETED").length;
  const avg = orders.length ? orders.reduce((s, o) => s + o.total, 0) / orders.length : 0;
  const topProduct = useMemo(() => {
    const counts: Record<string, number> = {};
    orders.forEach(o => o.items.forEach(i => counts[i.name] = (counts[i.name] || 0) + i.qty));
    return Object.entries(counts).sort((a,b) => b[1]-a[1])[0]?.[0] || "—";
  }, [orders]);

  function notify(message: string) {
    setToast(message); window.setTimeout(() => setToast(""), 2300);
  }
  function add(product: Product) {
    setCart(c => {
      const found = c.find(x => x.id === product.id);
      return found ? c.map(x => x.id === product.id ? { ...x, qty: x.qty + 1 } : x) : [...c, { ...product, qty: 1 }];
    });
  }
  function qty(id: string, delta: number) {
    setCart(c => c.map(x => x.id === id ? { ...x, qty: x.qty + delta } : x).filter(x => x.qty > 0));
  }
  function makeId() {
    try {
      if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
    } catch {}
    return `order-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  }
  function submit(event?: React.FormEvent<HTMLFormElement>) {
    event?.preventDefault();
    setSubmitError("");
    if (!cart.length) {
      setSubmitError("أضف صنفًا واحدًا على الأقل قبل إرسال الطلب.");
      return;
    }
    try {
      const nextNo = orders.length ? Math.max(...orders.map(o => o.no)) + 1 : 1001;
      const order: Order = { id: makeId(), no: nextNo, createdAt: new Date().toISOString(), items: cart.map(item => ({ ...item })), total, payment, status: "NEW", note: orderNote.trim() };
      setOrders(current => [order, ...current]);
      setCart([]);
      setOrderNote("");
      notify(`تم إرسال الطلب #${nextNo} للمطبخ`);
      setView("kds");
    } catch (error) {
      console.error("ServeIQ submit failed", error);
      setSubmitError("تعذر إرسال الطلب. حدّث الصفحة وحاول مرة ثانية.");
    }
  }
  function updateStatus(id: string, status: Status) {
    setOrders(o => o.map(x => x.id === id ? { ...x, status } : x));
  }
  function resetDemo() {
    if (confirm("مسح جميع الطلبات التجريبية؟")) setOrders([]);
  }

  return <div className="shell">
    <aside className="sidebar">
      <div className="brand">ServeIQ</div><div className="restaurant">حمسة مجالس</div>
      <nav className="nav">
        <button className={view==="dashboard"?"active":""} onClick={()=>setView("dashboard")}>الرئيسية</button>
        <button className={view==="pos"?"active":""} onClick={()=>setView("pos")}>الكاشير POS</button>
        <button className={view==="kds"?"active":""} onClick={()=>setView("kds")}>المطبخ KDS</button>
        <button className={view==="orders"?"active":""} onClick={()=>setView("orders")}>الطلبات</button>
        <button>المخزون</button><button>الموظفون</button>
      </nav>
    </aside>
    <main className="main">
      <div className="header"><div><h1>{view==="dashboard"?"لوحة التحكم":view==="pos"?"الكاشير POS":view==="kds"?"شاشة المطبخ":"سجل الطلبات"}</h1><div className="muted">ServeIQ v0.3 — حمسة مجالس</div></div><div className="top-actions"><button className="reset" onClick={resetDemo}>مسح البيانات التجريبية</button></div></div>

      {view === "dashboard" && <>
        <section className="grid cards">
          <div className="card"><div className="muted">مبيعات مكتملة</div><div className="value">{sales.toFixed(3)} د.ك</div></div>
          <div className="card"><div className="muted">عدد الطلبات</div><div className="value">{orders.length}</div></div>
          <div className="card"><div className="muted">طلبات بالمطبخ</div><div className="value">{kitchenCount}</div></div>
          <div className="card"><div className="muted">متوسط الفاتورة</div><div className="value">{avg.toFixed(3)} د.ك</div></div>
        </section>
        <section className="grid two" style={{marginTop:16}}>
          <div className="card"><h2>ServeIQ Copilot</h2><p>أكثر صنف مبيعًا: <strong>{topProduct}</strong></p><p>عندك <strong>{kitchenCount}</strong> طلب قيد التنفيذ.</p></div>
          <div className="card"><h2>التنبيهات</h2><p className="muted">سيتم ربط المخزون، الإقامات، الصيانة، والبصمة في الإصدارات القادمة.</p></div>
        </section>
      </>}

      {view === "pos" && <section className="grid two">
        <div className="grid products">{PRODUCTS.map(p => <button className="product" key={p.id} onClick={()=>add(p)}><div className="muted">{p.category}</div><h3>{p.name}</h3><div className="price">{p.price.toFixed(3)} د.ك</div></button>)}</div>
        <form className="card" onSubmit={submit}><h2>الطلب الحالي</h2>{!cart.length && <div className="empty">اضغط على صنف لإضافته</div>}
          {cart.map(i => <div className="order-line" key={i.id}><div><strong>{i.name}</strong><div className="qty"><button onClick={()=>qty(i.id,1)}>+</button><span>{i.qty}</span><button onClick={()=>qty(i.id,-1)}>-</button><button className="ghost danger" onClick={()=>setCart(c=>c.filter(x=>x.id!==i.id))}>حذف</button></div></div><strong>{(i.price*i.qty).toFixed(3)}</strong></div>)}
          <textarea className="field" placeholder="ملاحظة على الطلب: بدون بصل، زيادة دقوس..." value={orderNote} onChange={e=>setOrderNote(e.target.value)} />
          <div className="pay-grid">{(["KNET","CASH","VISA"] as Payment[]).map(p=><button key={p} className={`pay ${payment===p?"active":""}`} onClick={()=>setPayment(p)}>{p==="CASH"?"نقدي":p}</button>)}</div>
          <div className="total">الإجمالي: {total.toFixed(3)} د.ك</div>{submitError&&<div className="error-box">{submitError}</div>}<button type="submit" className="primary" disabled={!cart.length}>تأكيد وإرسال للمطبخ</button>
        </form>
      </section>}

      {view === "kds" && <section className="grid kds">{orders.filter(o=>o.status!=="COMPLETED").map(o => <article className={`ticket ${o.status.toLowerCase()}`} key={o.id}><div className="ticket-head"><h2>طلب #{o.no}</h2><span className="badge">{statusLabel[o.status]}</span></div><div className="muted">{new Date(o.createdAt).toLocaleTimeString("ar-KW",{hour:"2-digit",minute:"2-digit"})}</div>{o.items.map(i=><p key={i.id}>{i.name} × {i.qty}</p>)}{o.note&&<p><strong>ملاحظة:</strong> {o.note}</p>}<strong>{o.total.toFixed(3)} د.ك — {o.payment}</strong><div className="status-actions">{o.status==="NEW"&&<button onClick={()=>updateStatus(o.id,"PREPARING")}>ابدأ التحضير</button>}{o.status==="PREPARING"&&<button onClick={()=>updateStatus(o.id,"READY")}>جاهز</button>}{o.status==="READY"&&<button onClick={()=>updateStatus(o.id,"COMPLETED")}>تم التسليم</button>}</div></article>)}{!orders.some(o=>o.status!=="COMPLETED")&&<div className="card empty">لا توجد طلبات حالية في المطبخ.</div>}</section>}

      {view === "orders" && <div className="card"><table className="table"><thead><tr><th>الطلب</th><th>الوقت</th><th>الدفع</th><th>الإجمالي</th><th>الحالة</th></tr></thead><tbody>{orders.map(o=><tr key={o.id}><td>#{o.no}</td><td>{new Date(o.createdAt).toLocaleString("ar-KW")}</td><td>{o.payment}</td><td>{o.total.toFixed(3)}</td><td>{statusLabel[o.status]}</td></tr>)}</tbody></table>{!orders.length&&<div className="empty">لا توجد طلبات بعد.</div>}</div>}
    </main>{toast&&<div className="toast">{toast}</div>}
  </div>;
}
