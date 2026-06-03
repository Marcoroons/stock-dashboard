"""
app.py - the dashboard you'll actually use.

Run locally:   streamlit run app.py
Deploy:        push to GitHub -> Streamlit Community Cloud (see README)

Works even before Supabase is connected (watchlist falls back to session memory).
"""

from __future__ import annotations

import pandas as pd
import streamlit as st

import stock_analyzer as sa
import scoring as sc
import peers as pr
import news as nw
import backtest as bt
import investor_profile as pf
import handbook as hb
import portfolio as pt

try:
    import db
    _HAS_DB = "SUPABASE_URL" in st.secrets
except Exception:
    _HAS_DB = False

st.set_page_config(page_title="Stock Dashboard", page_icon="📈", layout="wide")

# --- exchange / suffix reference (foreign tickers need a Yahoo suffix) ------ #
SUFFIXES = [
    (".JK", "Indonesia (IDX, Jakarta)"), (".T", "Japan (Tokyo)"),
    (".HK", "Hong Kong"), (".SS", "China (Shanghai)"), (".SZ", "China (Shenzhen)"),
    (".SI", "Singapore (SGX)"), (".KL", "Malaysia (Bursa)"), (".BK", "Thailand (SET)"),
    (".KS", "South Korea (KOSPI)"), (".TW", "Taiwan"), (".NS", "India (NSE)"),
    (".BO", "India (BSE)"), (".AX", "Australia (ASX)"), (".NZ", "New Zealand"),
    (".L", "UK (London)"), (".DE", "Germany (XETRA)"), (".PA", "France (Paris)"),
    (".AS", "Netherlands (Amsterdam)"), (".MI", "Italy (Milan)"), (".MC", "Spain (Madrid)"),
    (".SW", "Switzerland (SIX)"), (".ST", "Sweden (Stockholm)"), (".OL", "Norway (Oslo)"),
    (".TO", "Canada (Toronto)"), (".SA", "Brazil (B3)"), (".SR", "Saudi Arabia (Tadawul)"),
    ("(none)", "United States (NYSE / Nasdaq)"),
]
_MARKET = {s: c for s, c in SUFFIXES}


def market_label(ticker):
    for suf, country in SUFFIXES:
        if suf != "(none)" and ticker.upper().endswith(suf):
            return country
    return "United States"


# --- small formatters ------------------------------------------------------- #
def fmt(x):
    return "n/a" if x is None else f"{x:,.2f}"


def fmt_big(x):
    if x is None:
        return "n/a"
    if abs(x) >= 1e9:
        return f"{x/1e9:,.2f}B"
    if abs(x) >= 1e6:
        return f"{x/1e6:,.2f}M"
    return f"{x:,.0f}"


def pctdelta(target, price):
    if not target or not price:
        return None
    return f"{(target - price) / price:+.1%} vs price"


# --- caching ---------------------------------------------------------------- #
@st.cache_data(ttl=900, show_spinner=False)
def get_fundamentals(ticker):
    return sa.fetch_fundamentals(ticker)


@st.cache_data(ttl=900, show_spinner=False)
def get_peer_comparison(ticker):
    f = get_fundamentals(ticker)
    plist = pr.peers_for(ticker)
    return (pr.compare_to_peers(f, plist), plist) if plist else (None, [])


@st.cache_data(ttl=1800, show_spinner=False)
def get_news(ticker):
    return nw.recent_news(ticker)


@st.cache_data(ttl=900, show_spinner=False)
def get_history(ticker, period):
    return sa.price_history(ticker, period=period)


@st.cache_data(ttl=1800, show_spinner=False)
def get_analyst(ticker):
    return sa.analyst_actions(ticker), sa.recommendation_breakdown(ticker)


@st.cache_data(ttl=900, show_spinner=False)
def run_backtest(ticker, amount, years, mode):
    return (bt.lump_sum(ticker, amount, years) if mode == "Lump sum"
            else bt.dca(ticker, amount, years))


# --- watchlist -------------------------------------------------------------- #
def wl_list():
    if _HAS_DB:
        return [r["ticker"] for r in db.list_watchlist()]
    return st.session_state.setdefault("watchlist", [])


def wl_pin(ticker):
    ticker = ticker.upper()
    if _HAS_DB:
        db.pin(ticker)
    else:
        wl = st.session_state.setdefault("watchlist", [])
        if ticker not in wl:
            wl.append(ticker)


def wl_unpin(ticker):
    if _HAS_DB:
        db.unpin(ticker)
    else:
        st.session_state.get("watchlist", []).remove(ticker)


# --- investor profile ------------------------------------------------------- #
def get_profile():
    if "profile" in st.session_state:
        return st.session_state["profile"]
    if _HAS_DB:
        try:
            p = db.load_profile()
            if p:
                st.session_state["profile"] = p
                return p
        except Exception:
            pass
    return None


def save_profile_data(p):
    st.session_state["profile"] = p
    if _HAS_DB:
        try:
            db.save_profile(p)
        except Exception:
            pass


def show_onboarding():
    st.title("📋 First, a quick risk & goals assessment")
    st.write("This shapes every score and suitability check that follows. It's a "
             "self-assessment of your preferences — not advice, and not a clinical "
             "test. Takes about a minute.")
    with st.form("onboarding"):
        answers = {}
        for q in pf.QUESTIONS:
            labels = [o[0] for o in q["opts"]]
            choice = st.radio(q["q"], labels, key=f"q_{q['id']}")
            answers[q["id"]] = dict(q["opts"])[choice]
        submitted = st.form_submit_button("Build my profile")
    if submitted:
        save_profile_data(pf.score_answers(answers))
        st.session_state.pop("force_onboarding", None)
        st.rerun()


def show_suitability(profile, f, overall, rr):
    s = pf.assess_suitability(profile, f, overall, rr)
    st.markdown("#### Does this suit *you*?")
    v = s["verdict"]
    (st.success if "Fits" in v else st.error if "Poor" in v else st.warning)(v)
    cc = st.columns(2)
    with cc[0]:
        st.markdown("**Why it fits**")
        for p in s["pros"]:
            st.markdown(f"🟢 {p}")
        if not s["pros"]:
            st.caption("No strong fit signals.")
    with cc[1]:
        st.markdown("**Why it might not**")
        for c in s["cons"]:
            st.markdown(f"🔴 {c}")
        if not s["cons"]:
            st.caption("No strong mismatch signals.")
    st.caption("Based on your stated profile, not financial advice.")


def show_handbook():
    st.markdown("#### 📚 Investor handbook")
    q = st.text_input("Search a concept", placeholder="e.g. Sharpe, PEG, RSI").lower().strip()
    shown = 0
    for cid, c in hb.CONCEPTS.items():
        if q and q not in c["name"].lower() and q not in cid:
            continue
        shown += 1
        with st.expander(f"{c['name']}  ·  {c['category']}"):
            st.write(f"**What it is** — {c['definition']}")
            st.write(f"**Formula** — {c['formula']}")
            st.write(f"**How to read it** — {c['interpretation']}")
            pref = ("Higher is better" if c["higher_better"] is True else
                    "Lower is better" if c["higher_better"] is False else
                    "Neither — match it to your profile")
            st.write(f"**Good** {c['good']}  ·  **Bad** {c['bad']}  ·  **{pref}**")
            st.write(f"**Common mistake** — {c['mistakes']}")
            st.write(f"**Limitation** — {c['limitations']}")
    if q and shown == 0:
        st.caption("No matching concept. Try another term.")


# --- holdings (DB or session fallback) -------------------------------------- #
def hold_list():
    if _HAS_DB:
        return db.list_holdings()
    return st.session_state.setdefault("holdings", [])


def hold_add(ticker, shares, cost_basis):
    ticker = ticker.upper()
    if _HAS_DB:
        db.add_holding(ticker, shares, cost_basis)
    else:
        hs = st.session_state.setdefault("holdings", [])
        hs[:] = [h for h in hs if h["ticker"] != ticker]
        hs.append({"ticker": ticker, "shares": shares, "cost_basis": cost_basis})


def hold_remove(ticker):
    if _HAS_DB:
        db.remove_holding(ticker)
    else:
        hs = st.session_state.get("holdings", [])
        hs[:] = [h for h in hs if h["ticker"] != ticker.upper()]


@st.cache_data(ttl=900, show_spinner=False)
def portfolio_data(holdings_key, period):
    holdings = [dict(t) for t in holdings_key]
    series = pt.combined_value_series(holdings, period)
    rows, total = pt.positions(holdings)
    metrics = pt.risk_metrics(series) if series is not None else {}
    rets = pt.period_returns(series) if series is not None else {}
    beta = pt.portfolio_beta(series, period=period) if series is not None else None
    alloc = pt.sector_allocation(rows)
    return series, rows, total, metrics, rets, beta, alloc


def show_portfolio(profile):
    st.markdown("## 💼 Portfolio health")
    st.caption(f"Personalised to: {pf.describe(profile)}")

    with st.expander("➕ Add or update a holding"):
        c = st.columns([2, 1, 1, 1])
        t = c[0].text_input("Ticker", key="h_t", placeholder="AAPL / TLKM.JK").upper().strip()
        sh = c[1].number_input("Shares", min_value=0.0, value=10.0, step=1.0, key="h_sh")
        cb = c[2].number_input("Cost basis / share", min_value=0.0, value=0.0,
                               step=1.0, key="h_cb")
        if c[3].button("Save", use_container_width=True) and t:
            hold_add(t, sh, cb)
            st.rerun()

    holdings = hold_list()
    if not holdings:
        st.info("Add a few holdings above to see your portfolio health.")
        return

    period = st.radio("Look-back", ["1y", "2y", "5y"], index=2,
                      horizontal=True, key="pf_period")
    key = tuple(tuple(sorted(h.items())) for h in holdings)
    try:
        series, rows, total, metrics, rets, beta, alloc = portfolio_data(key, period)
    except Exception as e:
        st.error(f"Couldn't build portfolio: {e}")
        return

    total_cost = sum(r["cost"] for r in rows if r["cost"]) or None
    t1, t2, t3 = st.columns(3)
    t1.metric("Total value", fmt_big(total))
    t2.metric("Total cost", fmt_big(total_cost))
    if total_cost:
        t3.metric("Gain / loss", fmt_big(total - total_cost),
                  f"{total/total_cost - 1:+.1%}")
    currencies = {r["currency"] for r in rows if r["currency"]}
    if len(currencies) > 1:
        st.warning(f"Mixed currencies ({', '.join(currencies)}) — totals across "
                   "currencies aren't meaningful. Keep one currency per portfolio.",
                   icon="⚠️")

    st.markdown("#### Returns")
    rc = st.columns(5)
    for i, k in enumerate(["daily", "weekly", "monthly", "ytd", "lifetime"]):
        v = rets.get(k)
        rc[i].metric(k.upper(), f"{v:+.2%}" if v is not None else "n/a")

    st.markdown("#### Risk metrics  ·  see the Handbook tab for what each means")
    m = st.columns(3)
    m[0].metric("CAGR", f"{metrics.get('cagr'):.1%}" if metrics.get("cagr") is not None else "n/a")
    m[1].metric("Volatility", f"{metrics.get('volatility'):.1%}" if metrics.get("volatility") else "n/a")
    m[2].metric("Beta", f"{beta:.2f}" if beta is not None else "n/a")
    m2 = st.columns(3)
    m2[0].metric("Sharpe", f"{metrics.get('sharpe'):.2f}" if metrics.get("sharpe") is not None else "n/a",
                 help="Return per unit of total risk. >1 solid.")
    m2[1].metric("Sortino", f"{metrics.get('sortino'):.2f}" if metrics.get("sortino") is not None else "n/a",
                 help="Like Sharpe but only counts downside risk.")
    m2[2].metric("Max drawdown", f"{metrics.get('max_drawdown'):.1%}" if metrics.get("max_drawdown") is not None else "n/a",
                 help="Worst peak-to-trough fall over the period.")
    st.caption("Returns assume you held today's positions across the whole period; "
               "risk-free rate assumed 4%. Beta is vs the S&P 500.")

    if series is not None and len(series):
        st.markdown("#### Value over time")
        st.line_chart(series, height=300)

    st.markdown("#### Positions")
    st.dataframe(
        [{"ticker": r["ticker"], "shares": r["shares"],
          "price": fmt(r["price"]), "value": fmt_big(r["value"]),
          "weight": f"{r['weight']:.1%}" if r["weight"] else "n/a",
          "gain/loss": f"{r['gain_loss']:+.1%}" if r["gain_loss"] is not None else "n/a",
          "sector": r["sector"]} for r in rows],
        use_container_width=True, hide_index=True)
    cols = st.columns(min(len(rows), 6) or 1)
    for i, r in enumerate(rows):
        if cols[i % len(cols)].button(f"Remove {r['ticker']}", key=f"hrm_{r['ticker']}"):
            hold_remove(r["ticker"])
            st.rerun()

    st.markdown("#### Allocation by sector  ·  concentration check")
    if alloc:
        st.bar_chart(pd.Series(alloc), height=240)
        top = max(alloc.values())
        if top > 0.4:
            st.warning(f"Your largest sector is {top:.0%} of the portfolio — that's "
                       "concentrated. Owning several names in one sector isn't "
                       "diversification.", icon="⚠️")


# --- live price ------------------------------------------------------------- #
@st.fragment(run_every="20s")
def live_price(ticker):
    try:
        fast = sa.yf.Ticker(ticker).fast_info
        price = fast.get("last_price") or fast.get("lastPrice")
        prev = fast.get("previous_close") or fast.get("previousClose")
        if price and prev:
            d = price - prev
            st.metric(f"{ticker}  ·  live (≈15-min delayed)",
                      f"{price:,.2f}", f"{d:+.2f} ({d/prev:+.2%})")
        elif price:
            st.metric(f"{ticker}  ·  live (≈15-min delayed)", f"{price:,.2f}")
    except Exception:
        st.caption("Live price unavailable right now.")


# --- views ------------------------------------------------------------------ #
def show_overview(f, profile=None):
    weights = pf.weights_for_profile(profile) if profile else sc.CATEGORY_WEIGHTS
    overall, cats, scored = sc.composite_score(f, category_weights=weights)
    v = sa.value_stock(f)
    rr = sc.risk_reward(f, v.blended_intrinsic)
    bull, bear = sc.bull_bear(scored)

    h = st.columns(4)
    h[0].metric("Price", fmt(f.price))
    h[1].metric("Your score", f"{overall:.0f}/100" if overall else "n/a")
    h[2].metric("Favorability",
                f"{rr.favorability_pct:.0f}%" if rr.favorability_pct else "n/a",
                help="Reward vs risk. 50% = even.")
    h[3].metric("Reward : Risk", f"{rr.ratio:.2f} : 1" if rr.ratio else "n/a")
    st.caption(sc.lean_from_score(overall) + "  —  your framework, not advice.")

    st.markdown("#### Valuation — price vs target vs intrinsic")
    vc = st.columns(4)
    vc[0].metric("Current price", fmt(f.price))
    vc[1].metric("Analyst target", fmt(f.analyst_target_mean),
                 pctdelta(f.analyst_target_mean, f.price))
    vc[2].metric("Intrinsic (blended)", fmt(v.blended_intrinsic),
                 pctdelta(v.blended_intrinsic, f.price))
    vc[3].metric("DCF / share", fmt(v.dcf_per_share),
                 pctdelta(v.dcf_per_share, f.price))
    st.caption("Deltas = upside/downside vs today. Intrinsic = average of "
               "Graham, P/E-implied and DCF estimates.")

    st.markdown("#### Book value vs market value")
    total_book = (f.book_value_per_share * f.shares_outstanding
                  if f.book_value_per_share and f.shares_outstanding else None)
    bc = st.columns(4)
    bc[0].metric("Market cap", fmt_big(f.market_cap))
    bc[1].metric("Book value (equity)", fmt_big(total_book))
    bc[2].metric("Price / Book", fmt(f.pb_ratio))
    bc[3].metric("Book value / share", fmt(f.book_value_per_share))
    st.caption("Market value = what investors pay today; book value = accounting "
               "net worth. P/B above 1 means it trades above book.")

    st.markdown("#### Risk & liquidity")
    rc = st.columns(4)
    rc[0].metric("Beta", fmt(f.beta),
                 help="Volatility vs the market. >1 swings more than the index.")
    rc[1].metric("Current ratio", fmt(f.current_ratio),
                 help="Short-term assets vs short-term bills. >1 covers the year.")
    rc[2].metric("Quick ratio", fmt(f.quick_ratio),
                 help="Current ratio excluding inventory - stricter liquidity test.")
    rc[3].metric("Debt / Equity", fmt(f.debt_to_equity),
                 help="Leverage. Higher = more risk in a downturn.")

    st.markdown("#### Bull & bear case (read from the numbers)")
    bb = st.columns(2)
    with bb[0]:
        st.markdown("**Bull**")
        for label, _ in bull:
            st.markdown(f"🟢 {label}")
        if not bull:
            st.caption("Nothing scored strong.")
    with bb[1]:
        st.markdown("**Bear**")
        for label, _ in bear:
            st.markdown(f"🔴 {label}")
        if not bear:
            st.caption("Nothing scored weak.")

    if profile:
        st.divider()
        show_suitability(profile, f, overall, rr)


def show_chart(ticker):
    period = st.radio("Period", ["1mo", "6mo", "1y", "5y"],
                      horizontal=True, index=2, key="period")
    hist = get_history(ticker, period)
    if hist is None or hist.empty:
        st.caption("No price history available.")
        return
    st.line_chart(hist["Close"], height=360)
    lo, hi = hist["Close"].min(), hist["Close"].max()
    chg = (hist["Close"].iloc[-1] / hist["Close"].iloc[0] - 1)
    s = st.columns(3)
    s[0].metric("Period change", f"{chg:+.1%}")
    s[1].metric("Period low", fmt(lo))
    s[2].metric("Period high", fmt(hi))


def show_backtest(ticker, f):
    cur = f.currency or ""
    st.markdown("#### Backtest — what already happened")
    c = st.columns(3)
    amount = c[0].number_input(f"Amount ({cur})", min_value=1.0,
                               value=1000.0, step=100.0, key="bt_amt")
    years = c[1].slider("Years back", 1, 20, 5, key="bt_yrs")
    mode = c[2].radio("How", ["Lump sum", "Monthly (DCA)"], key="bt_mode")
    mode_key = "Lump sum" if mode == "Lump sum" else "DCA"

    try:
        r = run_backtest(ticker, amount, years, mode_key)
    except Exception as e:
        st.error(f"Backtest failed: {e}")
        return
    if not r:
        st.caption("Not enough price history for this period.")
        return

    m = st.columns(4)
    m[0].metric("Total invested", fmt_big(r["invested"]))
    m[1].metric("Worth today", fmt_big(r["end_value"]),
                f"{r['total_return']:+.1%}" if r["total_return"] is not None else None)
    m[2].metric("Profit", fmt_big(r["profit"]))
    m[3].metric("Annualised", f"{r['cagr']:.1%}" if r["cagr"] is not None else "n/a",
                help="Lump sum: CAGR. DCA: money-weighted return (IRR).")
    if r.get("value_series") is not None and len(r["value_series"]):
        st.line_chart(r["value_series"], height=300)
    st.caption("Uses dividend/split-adjusted prices (≈ total return with dividends "
               "reinvested). This is the past — it does not predict the future.")

    st.divider()
    st.markdown("#### Project forward — a what-if, not a forecast")
    default_rate = 7.0
    if r["cagr"] is not None and -0.5 < r["cagr"] < 0.5:
        default_rate = round(r["cagr"] * 100, 1)
    p = st.columns(3)
    rate = p[0].number_input("Assumed annual return %", value=float(default_rate),
                             step=0.5, key="pj_rate") / 100
    pj_years = p[1].slider("Project years", 1, 30, 10, key="pj_yrs")
    monthly = p[2].number_input(f"Add monthly ({cur})", min_value=0.0,
                                value=0.0, step=50.0, key="pj_mo")
    rows = bt.project(r["end_value"], rate, pj_years, monthly)
    proj = pd.Series({y: b for y, b in rows})
    st.line_chart(proj, height=260)
    final = rows[-1][1]
    contributed = r["end_value"] + monthly * 12 * pj_years
    f1, f2 = st.columns(2)
    f1.metric(f"Projected value in {pj_years}y", fmt_big(final))
    f2.metric("Of which you put in", fmt_big(contributed))
    st.caption("⚠️ This simply grows your money at the rate you typed. Markets "
               "don't deliver steady returns — real years swing up and down, and "
               "past performance is not a promise. Treat this as a planning sketch.")


def show_metrics(f):
    st.write("**All metrics** — see what each means")
    rows = []
    for key, cfg in sc.METRIC_CONFIG.items():
        label, desc = sc.GLOSSARY.get(key, (key, ""))
        val = sc._metric_value(f, key)
        rows.append({"metric": label,
                     "value": "n/a" if val is None else round(val, 3),
                     "what it means": desc})
    st.dataframe(rows, use_container_width=True, hide_index=True)


def show_peers(ticker):
    comp, plist = get_peer_comparison(ticker)
    if not comp:
        st.caption(f"No peer group defined for {ticker}. Add one in peers.py "
                   "(SECTOR_PEERS) to enable sector-relative ranking.")
        return
    st.write(f"**Vs peers:** {', '.join(plist)}  (percentile: 100 = best in group)")
    rows = []
    for key, d in comp.items():
        label = sc.GLOSSARY.get(key, (key,))[0]
        rows.append({
            "metric": label,
            "this stock": "n/a" if d["value"] is None else round(d["value"], 3),
            "peer median": "n/a" if d["peer_median"] is None else round(d["peer_median"], 3),
            "percentile": "n/a" if d["percentile"] is None else f"{d['percentile']:.0f}",
        })
    st.dataframe(rows, use_container_width=True, hide_index=True)


def show_analysts(ticker, f):
    actions, breakdown = get_analyst(ticker)
    st.markdown("#### Analyst consensus")
    c = st.columns(3)
    c[0].metric("Consensus", (f.recommendation_key or "n/a").replace("_", " "))
    c[1].metric("Mean rating", fmt(f.recommendation_mean),
                help="1 = strong buy, 5 = strong sell")
    c[2].metric("Coverage", f"{f.num_analysts} analysts" if f.num_analysts else "n/a")
    if breakdown:
        st.bar_chart(pd.Series(breakdown), height=220)

    st.markdown("#### Recent rating changes — who said what")
    if actions:
        st.dataframe(
            actions, use_container_width=True, hide_index=True,
            column_config={"date": "Date", "firm": "Firm", "action": "Action",
                           "from_grade": "From", "to_grade": "To"},
        )
    else:
        st.caption("No recent analyst rating changes reported.")
    st.caption("Source: aggregated via Yahoo Finance; coverage may be incomplete. "
               "Third-party opinions, not this tool's signal.")


def show_news(ticker):
    items = get_news(ticker)
    st.caption(f"Headline tilt (reading aid, NOT a signal): {nw.headline_tilt(items)}")
    for h in items:
        if h["link"]:
            st.markdown(f"- [{h['title']}]({h['link']})  ·  *{h['publisher']}*")
        else:
            st.markdown(f"- {h['title']}  ·  *{h['publisher']}*")
    if not items:
        st.caption("No recent headlines found.")


# --- layout ----------------------------------------------------------------- #
def main():
    st.title("📈 Long-term Stock Dashboard")
    if not _HAS_DB:
        st.warning("Supabase not connected — watchlist & profile are temporary "
                   "this session.", icon="⚠️")

    # Mandatory profiling gate: no analysis until the assessment is done.
    profile = get_profile()
    if not profile or st.session_state.get("force_onboarding"):
        show_onboarding()
        return

    with st.sidebar:
        page = st.radio("Go to", ["📊 Analyze a stock", "💼 My portfolio"],
                        key="nav")
        st.divider()
        st.header("Watchlist")
        for t in wl_list():
            cols = st.columns([3, 1])
            if cols[0].button(t, use_container_width=True, key=f"go_{t}"):
                st.session_state.ticker = t
            if cols[1].button("✕", key=f"rm_{t}"):
                wl_unpin(t)
                st.rerun()
        st.divider()
        new_t = st.text_input("Search a ticker", placeholder="e.g. AAPL").upper().strip()
        st.caption("🌐 Non-US stocks need a Yahoo suffix — e.g. **TLKM.JK** "
                   "(Indonesia), **7203.T** (Japan).")
        with st.expander("Ticker suffixes by country"):
            st.dataframe(
                [{"suffix": s, "market": c} for s, c in SUFFIXES],
                use_container_width=True, hide_index=True,
            )
        cta = st.columns(2)
        if cta[0].button("Analyze", use_container_width=True) and new_t:
            st.session_state.ticker = new_t
        if cta[1].button("📌 Pin", use_container_width=True) and new_t:
            wl_pin(new_t)
            st.session_state.ticker = new_t
            st.rerun()

        st.divider()
        st.caption("**Your profile**")
        st.caption(pf.describe(profile))
        if st.button("Retake assessment", use_container_width=True):
            st.session_state["force_onboarding"] = True
            st.rerun()

    if page == "💼 My portfolio":
        show_portfolio(profile)
        return

    ticker = st.session_state.get("ticker")
    if not ticker:
        st.info("Search a ticker in the sidebar to begin.")
        return

    try:
        f = get_fundamentals(ticker)
    except Exception as e:
        st.error(f"Couldn't load {ticker}: {e}")
        return

    live_price(ticker)
    st.subheader(f"{f.name or ticker}  ·  {f.sector or ''} / {f.industry or ''}")
    st.caption(f"{market_label(ticker)} · prices in {f.currency or 'local currency'}")
    if f.summary:
        with st.expander("What this company does"):
            st.write(f.summary)

    tabs = st.tabs(["Overview", "Price chart", "Backtest", "All metrics",
                    "Vs peers", "Analysts", "News", "Handbook"])
    with tabs[0]:
        show_overview(f, profile)
    with tabs[1]:
        show_chart(ticker)
    with tabs[2]:
        show_backtest(ticker, f)
    with tabs[3]:
        show_metrics(f)
    with tabs[4]:
        show_peers(ticker)
    with tabs[5]:
        show_analysts(ticker, f)
    with tabs[6]:
        show_news(ticker)
    with tabs[7]:
        show_handbook()


if __name__ == "__main__":
    main()
