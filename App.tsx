import React, {useState} from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

// ============================================================
// الفئات والوحدات (بسيطة جداً)
// ============================================================
type Unit = {
  id: string;
  name: string;
  factor: number; // معامل التحويل إلى الوحدة الأساسية
};

type Category = {
  id: string;
  name: string;
  baseUnitId: string;
  units: Unit[];
  isTemperature?: boolean;
};

const CATEGORIES: Category[] = [
  {
    id: 'length',
    name: 'الطول',
    baseUnitId: 'm',
    units: [
      {id: 'mm', name: 'مم', factor: 0.001},
      {id: 'cm', name: 'سم', factor: 0.01},
      {id: 'm', name: 'متر', factor: 1},
      {id: 'km', name: 'كم', factor: 1000},
    ],
  },
  {
    id: 'weight',
    name: 'الوزن',
    baseUnitId: 'kg',
    units: [
      {id: 'g', name: 'جرام', factor: 0.001},
      {id: 'kg', name: 'كجم', factor: 1},
      {id: 'ton', name: 'طن', factor: 1000},
      {id: 'lb', name: 'رطل', factor: 0.453592},
    ],
  },
  {
    id: 'temperature',
    name: 'الحرارة',
    baseUnitId: 'c',
    isTemperature: true,
    units: [
      {id: 'c', name: 'سيلزيوس', factor: 1},
      {id: 'f', name: 'فهرنهايت', factor: 1},
      {id: 'k', name: 'كلفن', factor: 1},
    ],
  },
];

// ============================================================
// التحويل (دالة واحدة بسيطة)
// ============================================================
function convert(value: number, fromId: string, toId: string, category: Category): number {
  // حالة الحرارة (منطق خاص)
  if (category.isTemperature) {
    let celsius = value;
    if (fromId === 'f') celsius = (value - 32) * 5 / 9;
    else if (fromId === 'k') celsius = value - 273.15;

    if (toId === 'c') return celsius;
    if (toId === 'f') return celsius * 9 / 5 + 32;
    return celsius + 273.15;
  }

  // الحالة العادية
  const fromUnit = category.units.find(u => u.id === fromId);
  const toUnit = category.units.find(u => u.id === toId);
  if (!fromUnit || !toUnit) return 0;

  const valueInBase = value * fromUnit.factor;
  return valueInBase / toUnit.factor;
}

// ============================================================
// تنسيق الرقم
// ============================================================
function fmt(n: number): string {
  if (!isFinite(n)) return '0';
  if (n === 0) return '0';
  if (Math.abs(n) < 0.0001) return n.toExponential(3);
  if (Math.abs(n) > 1000000) return n.toExponential(3);
  return (Math.round(n * 10000) / 10000).toString();
}

// ============================================================
// التطبيق
// ============================================================
export default function App() {
  const [categoryIndex, setCategoryIndex] = useState(0);
  const [fromId, setFromId] = useState('mm');
  const [toId, setToId] = useState('m');
  const [input, setInput] = useState('1');

  const category = CATEGORIES[categoryIndex];

  // حساب النتيجة مباشرة
  const numInput = parseFloat(input) || 0;
  const result = convert(numInput, fromId, toId, category);

  // تغيير الفئة
  const changeCategory = (idx: number) => {
    setCategoryIndex(idx);
    const newCat = CATEGORIES[idx];
    setFromId(newCat.units[0].id);
    setToId(newCat.units[1].id);
    setInput('1');
  };

  // تبديل
  const swap = () => {
    const tmp = fromId;
    setFromId(toId);
    setToId(tmp);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.title}>الذره</Text>
      </View>

      {/* التبويبات */}
      <View style={styles.tabsRow}>
        {CATEGORIES.map((cat, idx) => (
          <TouchableOpacity
            key={cat.id}
            style={[styles.tab, idx === categoryIndex && styles.tabActive]}
            onPress={() => changeCategory(idx)}>
            <Text style={[styles.tabText, idx === categoryIndex && styles.tabTextActive]}>
              {cat.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent}>
        {/* حقل الإدخال */}
        <Text style={styles.label}>القيمة</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={input}
          onChangeText={setInput}
          placeholder="1"
          placeholderTextColor="#5A6472"
        />

        {/* اختيار الوحدة من */}
        <Text style={styles.label}>من</Text>
        <View style={styles.chipsRow}>
          {category.units.map(unit => (
            <TouchableOpacity
              key={unit.id}
              style={[styles.chip, unit.id === fromId && styles.chipActive]}
              onPress={() => setFromId(unit.id)}>
              <Text style={[styles.chipText, unit.id === fromId && styles.chipTextActive]}>
                {unit.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* زر التبديل */}
        <TouchableOpacity style={styles.swapBtn} onPress={swap}>
          <Text style={styles.swapBtnText}>تبديل الوحدات</Text>
        </TouchableOpacity>

        {/* اختيار الوحدة إلى */}
        <Text style={styles.label}>إلى</Text>
        <View style={styles.chipsRow}>
          {category.units.map(unit => (
            <TouchableOpacity
              key={unit.id}
              style={[styles.chip, unit.id === toId && styles.chipActive]}
              onPress={() => setToId(unit.id)}>
              <Text style={[styles.chipText, unit.id === toId && styles.chipTextActive]}>
                {unit.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* النتيجة */}
        <View style={styles.resultBox}>
          <Text style={styles.resultLabel}>النتيجة</Text>
          <Text style={styles.resultValue}>{fmt(result)}</Text>
          <Text style={styles.formula}>
            {numInput} {category.units.find(u => u.id === fromId)?.name} = {fmt(result)} {category.units.find(u => u.id === toId)?.name}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ============================================================
// الأنماط
// ============================================================
const C = {
  bg: '#0A0E14',
  surface: '#141B24',
  surfaceAlt: '#1B242F',
  border: '#303E4D',
  text: '#F5F7FA',
  muted: '#9DABBB',
  primary: '#3791FF',
  primaryDark: '#2570CC',
  success: '#36C284',
};

const styles = StyleSheet.create({
  safe: {flex: 1, backgroundColor: C.bg},
  header: {padding: 20, paddingBottom: 12},
  title: {color: C.text, fontSize: 26, fontWeight: '800', textAlign: 'right'},
  tabsRow: {
    flexDirection: 'row',
    paddingHorizontal: 14,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 18,
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    marginRight: 8,
  },
  tabActive: {backgroundColor: C.primary, borderColor: C.primary},
  tabText: {color: C.muted, fontSize: 13, fontWeight: '600'},
  tabTextActive: {color: '#FFFFFF'},
  body: {flex: 1},
  bodyContent: {padding: 16, paddingBottom: 40},
  label: {
    color: C.muted,
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 16,
    textAlign: 'right',
  },
  input: {
    color: C.text,
    fontSize: 28,
    fontWeight: '700',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: C.surface,
    textAlign: 'right',
    borderWidth: 1,
    borderColor: C.border,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
  },
  chipActive: {backgroundColor: C.primaryDark, borderColor: C.primary},
  chipText: {color: C.muted, fontSize: 13, fontWeight: '600'},
  chipTextActive: {color: '#FFFFFF'},
  swapBtn: {
    alignSelf: 'center',
    marginVertical: 16,
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 22,
    backgroundColor: C.surfaceAlt,
    borderWidth: 1,
    borderColor: C.border,
  },
  swapBtnText: {color: C.primary, fontSize: 14, fontWeight: '700'},
  resultBox: {
    marginTop: 24,
    padding: 20,
    borderRadius: 18,
    backgroundColor: C.surfaceAlt,
    borderWidth: 1,
    borderColor: C.primary,
  },
  resultLabel: {
    color: C.muted,
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'right',
    marginBottom: 6,
  },
  resultValue: {
    color: C.success,
    fontSize: 36,
    fontWeight: '800',
    textAlign: 'right',
  },
  formula: {
    color: C.muted,
    fontSize: 12,
    textAlign: 'right',
    marginTop: 10,
  },
});

<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
<title>ATOMIC LAB 3D — Advanced Atomic Visualization</title>
<style>
:root{
  --bg:#080c16; --panel:#0f1522; --panel-2:#141c2c; --panel-3:#1a2436;
  --border:#1e2a3e; --border-2:#2a3852;
  --text:#e8eef8; --text-2:#7d8ba0; --text-3:#566478;
  --accent:#22d3ee; --accent-2:#3b82f6; --accent-3:#8b5cf6;
  --proton:#ff6b5b; --neutron:#4fc3f7; --electron:#8b5cf6;
  --ok:#22c55e; --warn:#f59e0b; --err:#ef4444;
  --radius:10px; --radius-sm:6px;
}
*{box-sizing:border-box;margin:0;padding:0;-webkit-tap-highlight-color:transparent}
html,body{height:100%;overflow:hidden;font-family:'Inter','Segoe UI',-apple-system,BlinkMacSystemFont,sans-serif;background:var(--bg);color:var(--text);font-size:13px;line-height:1.4}
button{font-family:inherit;font-size:inherit;color:inherit;background:none;border:none;cursor:pointer;padding:0}
button:disabled{opacity:.4;cursor:not-allowed}
input[type=range]{-webkit-appearance:none;appearance:none;background:transparent;width:100%;height:20px}
input[type=range]::-webkit-slider-runnable-track{height:4px;background:var(--panel-3);border-radius:2px}
input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;appearance:none;width:14px;height:14px;border-radius:50%;background:var(--accent);margin-top:-5px;box-shadow:0 0 0 3px rgba(34,211,238,.15)}
input[type=range]::-moz-range-track{height:4px;background:var(--panel-3);border-radius:2px}
input[type=range]::-moz-range-thumb{width:14px;height:14px;border-radius:50%;background:var(--accent);border:none}

#app{display:grid;grid-template-rows:58px 1fr auto;grid-template-columns:250px 1fr 300px;grid-template-areas:"top top top" "left view right" "bottom bottom bottom";height:100vh;width:100vw;background:radial-gradient(ellipse at 50% 0%,#0f1729 0%,#080c16 60%)}

/* === TOP BAR === */
#topbar{grid-area:top;display:flex;align-items:center;gap:16px;padding:0 16px;background:linear-gradient(180deg,rgba(15,21,34,.95),rgba(15,21,34,.75));border-bottom:1px solid var(--border);backdrop-filter:blur(12px);z-index:20}
#logo{display:flex;align-items:center;gap:10px;font-weight:700;font-size:15px;letter-spacing:.5px}
#logo .glyph{width:30px;height:30px;border-radius:8px;background:radial-gradient(circle at 30% 30%,var(--accent),var(--accent-2) 60%,#0a1e30);box-shadow:0 0 16px rgba(34,211,238,.4),inset 0 0 8px rgba(255,255,255,.2);position:relative}
#logo .glyph::after{content:'';position:absolute;inset:8px;border-radius:50%;border:2px solid rgba(255,255,255,.55);border-top-color:transparent;transform:rotate(45deg)}
#logo .name{background:linear-gradient(90deg,var(--accent),#a5f3fc 60%,#fff);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;font-size:15px;letter-spacing:1.5px}
#topbar .element-badge{display:flex;align-items:center;gap:12px;padding:4px 14px;border-radius:8px;background:var(--panel-2);border:1px solid var(--border)}
#topbar .element-badge .sym{font-size:22px;font-weight:800;color:var(--accent);line-height:1}
#topbar .element-badge .meta{display:flex;flex-direction:column;line-height:1.15}
#topbar .element-badge .meta .nm{font-weight:600;font-size:12px}
#topbar .element-badge .meta .z{font-size:10px;color:var(--text-2);letter-spacing:.5px}
#topbar .spacer{flex:1}
.mode-tabs{display:flex;gap:2px;background:var(--panel);border:1px solid var(--border);border-radius:8px;padding:3px}
.mode-tabs button{padding:6px 12px;font-size:11.5px;font-weight:500;color:var(--text-2);border-radius:6px;transition:all .15s}
.mode-tabs button.active{background:linear-gradient(180deg,var(--accent-2),#2563eb);color:#fff;box-shadow:0 2px 8px rgba(59,130,246,.35)}
.mode-tabs button:hover:not(.active){color:var(--text);background:var(--panel-3)}
.top-icon-btn{width:34px;height:34px;border-radius:8px;background:var(--panel-2);border:1px solid var(--border);display:flex;align-items:center;justify-content:center;color:var(--text-2);transition:all .15s}
.top-icon-btn:hover{background:var(--panel-3);color:var(--accent);border-color:var(--border-2)}
.top-icon-btn svg{width:17px;height:17px;stroke:currentColor;fill:none;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}

/* === LEFT: ELEMENT SELECTOR === */
#elementPanel{grid-area:left;background:linear-gradient(180deg,var(--panel),var(--bg));border-right:1px solid var(--border);padding:12px;overflow-y:auto;display:flex;flex-direction:column;gap:10px}
#elementPanel::-webkit-scrollbar{width:6px}
#elementPanel::-webkit-scrollbar-thumb{background:var(--border-2);border-radius:3px}
.panel-title{font-size:10px;letter-spacing:1.5px;color:var(--text-3);text-transform:uppercase;font-weight:600;padding:4px 4px 0}
#searchBox{width:100%;padding:8px 10px;background:var(--panel-2);border:1px solid var(--border);border-radius:6px;color:var(--text);font-size:12px;outline:none;transition:border-color .15s}
#searchBox:focus{border-color:var(--accent)}
#searchBox::placeholder{color:var(--text-3)}
#elementGrid{display:grid;grid-template-columns:repeat(5,1fr);gap:5px}
.element-tile{aspect-ratio:1;background:var(--panel-2);border:1px solid var(--border);border-radius:6px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:0;cursor:pointer;transition:all .15s;position:relative;overflow:hidden}
.element-tile::before{content:'';position:absolute;top:0;left:0;right:0;height:2px;background:transparent;transition:background .15s}
.element-tile:hover{background:var(--panel-3);border-color:var(--border-2);transform:translateY(-1px)}
.element-tile.selected{background:linear-gradient(180deg,rgba(59,130,246,.25),rgba(59,130,246,.1));border-color:var(--accent-2);box-shadow:0 0 0 1px var(--accent-2),0 4px 12px rgba(59,130,246,.25)}
.element-tile.selected::before{background:linear-gradient(90deg,var(--accent),var(--accent-2))}
.element-tile .z{font-size:8.5px;color:var(--text-3);font-weight:600;line-height:1}
.element-tile .sym{font-size:15px;font-weight:700;color:var(--text);line-height:1;margin-top:1px}
.element-tile.selected .sym{color:var(--accent)}
.element-tile .nm{font-size:7.5px;color:var(--text-2);line-height:1;margin-top:1px}
.legend{display:flex;flex-direction:column;gap:6px;padding:10px;background:var(--panel-2);border:1px solid var(--border);border-radius:8px;font-size:11px}
.legend .row{display:flex;align-items:center;gap:8px;color:var(--text-2)}
.legend .dot{width:9px;height:9px;border-radius:50%;flex-shrink:0}
.legend .dot.proton{background:var(--proton);box-shadow:0 0 8px var(--proton)}
.legend .dot.neutron{background:var(--neutron);box-shadow:0 0 8px var(--neutron)}
.legend .dot.electron{background:var(--electron);box-shadow:0 0 8px var(--electron)}
.legend .row strong{color:var(--text);font-weight:600}

/* === CENTER: VIEWPORT === */
#viewport{grid-area:viewport;position:relative;overflow:hidden;background:radial-gradient(ellipse at center,#0b1220 0%,#050810 70%)}
#canvas{display:block;width:100%;height:100%}
#viewport-overlay{position:absolute;inset:0;pointer-events:none;background-image:linear-gradient(rgba(34,211,238,.03) 1px,transparent 1px),linear-gradient(90deg,rgba(34,211,238,.03) 1px,transparent 1px);background-size:40px 40px;mask-image:radial-gradient(ellipse at center,black 30%,transparent 75%);-webkit-mask-image:radial-gradient(ellipse at center,black 30%,transparent 75%)}
#hud{position:absolute;top:12px;left:12px;display:flex;flex-direction:column;gap:6px;pointer-events:none}
.hud-card{background:rgba(10,15,25,.85);border:1px solid var(--border);border-radius:8px;padding:8px 12px;backdrop-filter:blur(8px);font-size:11px;min-width:140px}
.hud-card .label{color:var(--text-3);font-size:9px;letter-spacing:1px;text-transform:uppercase;margin-bottom:2px}
.hud-card .value{color:var(--text);font-weight:600;font-size:13px}
.hud-card .value.mono{font-family:'JetBrains Mono','Consolas',monospace;font-size:12px}
#fpsHud{position:absolute;top:12px;right:12px;background:rgba(10,15,25,.85);border:1px solid var(--border);border-radius:6px;padding:5px 10px;font-size:10px;color:var(--text-2);backdrop-filter:blur(8px);font-family:'JetBrains Mono',monospace;pointer-events:none}
#fpsHud.good{color:var(--ok)}
#fpsHud.bad{color:var(--warn)}
#webglError{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;background:rgba(8,12,22,.95);color:var(--text);padding:20px;text-align:center;z-index:5}
#webglError[hidden]{display:none}

/* === RIGHT: INFO PANEL === */
#infoPanel{grid-area:right;background:linear-gradient(180deg,var(--panel),var(--bg));border-left:1px solid var(--border);padding:12px;overflow-y:auto;display:flex;flex-direction:column;gap:10px}
#infoPanel::-webkit-scrollbar{width:6px}
#infoPanel::-webkit-scrollbar-thumb{background:var(--border-2);border-radius:3px}
.info-block{background:var(--panel-2);border:1px solid var(--border);border-radius:8px;padding:10px 12px}
.info-block .ttl{font-size:9.5px;letter-spacing:1.2px;text-transform:uppercase;color:var(--text-3);font-weight:600;margin-bottom:8px}
.info-row{display:flex;justify-content:space-between;align-items:center;padding:3px 0;font-size:12px}
.info-row .k{color:var(--text-2)}
.info-row .v{color:var(--text);font-weight:600;font-family:'JetBrains Mono','Consolas',monospace;font-size:11.5px;text-align:right}
.info-row .v.accent{color:var(--accent)}
.particle-counts{display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px;margin-top:4px}
.pc{text-align:center;padding:6px 4px;background:var(--panel);border-radius:6px;border:1px solid var(--border)}
.pc .num{font-size:18px;font-weight:700;font-family:'JetBrains Mono',monospace;line-height:1}
.pc.p .num{color:var(--proton)}
.pc.n .num{color:var(--neutron)}
.pc.e .num{color:var(--electron)}
.pc .lbl{font-size:9px;color:var(--text-3);letter-spacing:.5px;text-transform:uppercase;margin-top:2px}
.config-str{font-family:'JetBrains Mono','Consolas',monospace;font-size:11.5px;color:var(--accent);line-height:1.6;word-break:break-word}
.shell-bar{display:flex;flex-direction:column;gap:4px;margin-top:6px}
.shell-row{display:flex;align-items:center;gap:6px;font-size:11px}
.shell-row .lbl{width:16px;color:var(--text-2);font-weight:600;font-family:monospace}
.shell-row .bar{flex:1;height:6px;background:var(--panel);border-radius:3px;overflow:hidden}
.shell-row .fill{height:100%;border-radius:3px;transition:width .3s}
.shell-row .cnt{width:20px;text-align:right;color:var(--text-2);font-family:monospace;font-size:10px}
.isotope-select{width:100%;padding:6px 8px;background:var(--panel);border:1px solid var(--border);border-radius:6px;color:var(--text);font-size:12px;font-family:inherit;outline:none;cursor:pointer}
.isotope-select:focus{border-color:var(--accent)}
.charge-selector{display:flex;gap:3px;margin-top:6px}
.charge-selector button{flex:1;padding:5px 0;font-size:11px;font-weight:600;background:var(--panel);border:1px solid var(--border);border-radius:5px;color:var(--text-2);font-family:monospace;transition:all .12s}
.charge-selector button:hover{background:var(--panel-3);color:var(--text)}
.charge-selector button.active{background:linear-gradient(180deg,var(--accent-2),#2563eb);color:#fff;border-color:var(--accent-2)}
.info-desc{font-size:11.5px;color:var(--text-2);line-height:1.5;margin-top:4px}

/* === BOTTOM BAR === */
#bottombar{grid-area:bottom;background:linear-gradient(0deg,rgba(15,21,34,.95),rgba(15,21,34,.85));border-top:1px solid var(--border);padding:8px 12px;display:flex;align-items:center;gap:10px;backdrop-filter:blur(12px);z-index:20;overflow-x:auto}
#bottombar::-webkit-scrollbar{height:4px}
#bottombar::-webkit-scrollbar-thumb{background:var(--border-2)}
.ctrl-group{display:flex;align-items:center;gap:4px;padding-right:10px;border-right:1px solid var(--border);flex-shrink:0}
.ctrl-group:last-child{border-right:none;padding-right:0}
.ctrl-group .glbl{font-size:9px;color:var(--text-3);text-transform:uppercase;letter-spacing:1px;margin-right:4px;white-space:nowrap}
.icon-btn{width:34px;height:34px;border-radius:7px;background:var(--panel-2);border:1px solid var(--border);display:flex;align-items:center;justify-content:center;color:var(--text-2);transition:all .12s;flex-shrink:0;position:relative}
.icon-btn:hover{background:var(--panel-3);color:var(--text);border-color:var(--border-2)}
.icon-btn.active{background:linear-gradient(180deg,rgba(34,211,238,.2),rgba(34,211,238,.08));color:var(--accent);border-color:var(--accent)}
.icon-btn svg{width:16px;height:16px;stroke:currentColor;fill:none;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
.slider-mini{width:80px;flex-shrink:0}
.speed-val{font-family:monospace;font-size:10px;color:var(--accent);width:30px;text-align:center;flex-shrink:0}

/* === MODALS === */
.modal-backdrop{position:fixed;inset:0;background:rgba(0,0,0,.6);backdrop-filter:blur(4px);z-index:100;display:none;align-items:center;justify-content:center;padding:20px}
.modal-backdrop.open{display:flex}
.modal{background:var(--panel);border:1px solid var(--border-2);border-radius:12px;width:100%;max-width:520px;max-height:85vh;overflow-y:auto;box-shadow:0 20px 60px rgba(0,0,0,.6)}
.modal::-webkit-scrollbar{width:6px}
.modal::-webkit-scrollbar-thumb{background:var(--border-2);border-radius:3px}
.modal-header{display:flex;align-items:center;justify-content:space-between;padding:16px 20px;border-bottom:1px solid var(--border)}
.modal-header h2{font-size:15px;font-weight:600}
.modal-close{width:28px;height:28px;border-radius:6px;background:var(--panel-2);display:flex;align-items:center;justify-content:center;color:var(--text-2)}
.modal-close:hover{background:var(--panel-3);color:var(--text)}
.modal-body{padding:16px 20px}
.setting-row{display:flex;align-items:center;justify-content:space-between;padding:10px 0;border-bottom:1px solid var(--border)}
.setting-row:last-child{border-bottom:none}
.setting-row .lbl{font-size:12.5px;color:var(--text)}
.setting-row .sub{font-size:10.5px;color:var(--text-3);margin-top:1px}
.setting-row .ctrl{width:180px;display:flex;justify-content:flex-end;align-items:center;gap:8px}
.setting-row .ctrl .val{font-family:monospace;font-size:11px;color:var(--accent);min-width:36px;text-align:right}
.toggle{position:relative;width:38px;height:20px;background:var(--panel-3);border-radius:10px;cursor:pointer;transition:background .15s;flex-shrink:0;border:1px solid var(--border)}
.toggle.on{background:var(--accent-2);border-color:var(--accent-2)}
.toggle::after{content:'';position:absolute;top:2px;left:2px;width:14px;height:14px;border-radius:50%;background:#fff;transition:transform .15s}
.toggle.on::after{transform:translateX(18px)}
.quality-btns{display:flex;gap:4px}
.quality-btns button{padding:4px 10px;font-size:11px;background:var(--panel-2);border:1px solid var(--border);border-radius:5px;color:var(--text-2)}
.quality-btns button.active{background:var(--accent-2);color:#fff;border-color:var(--accent-2)}
.note-box{background:var(--panel-2);border:1px solid var(--border);border-radius:8px;padding:12px;margin-bottom:10px;font-size:11.5px;color:var(--text-2);line-height:1.55}
.note-box strong{color:var(--text);display:block;margin-bottom:4px;font-size:12px}

/* Tooltip */
[data-tip]{position:relative}
[data-tip]:hover::after{content:attr(data-tip);position:absolute;bottom:calc(100% + 6px);left:50%;transform:translateX(-50%);background:#000;color:#fff;padding:5px 9px;border-radius:5px;font-size:10.5px;white-space:nowrap;z-index:200;pointer-events:none;font-weight:500;letter-spacing:.2px;border:1px solid var(--border-2)}
[data-tip]:hover::before{content:'';position:absolute;bottom:calc(100% + 1px);left:50%;transform:translateX(-50%);border:4px solid transparent;border-top-color:#000;z-index:200;pointer-events:none}

/* === RESPONSIVE === */
@media (max-width:1024px){
  #app{grid-template-columns:200px 1fr 260px}
}
@media (max-width:860px){
  #app{grid-template-rows:52px 1fr 240px auto;grid-template-columns:1fr;grid-template-areas:"top" "view" "left" "bottom"}
  #infoPanel{display:none}
  #elementPanel{border-right:none;border-top:1px solid var(--border);display:grid;grid-template-columns:1fr 1fr;gap:8px;padding:8px}
  #elementPanel .panel-title{grid-column:1/-1}
  #searchBox{grid-column:1/-1}
  #elementGrid{grid-template-columns:repeat(10,1fr);grid-column:1/-1}
  .legend{grid-column:1/-1;flex-direction:row;flex-wrap:wrap}
  #topbar{padding:0 8px;gap:8px}
  #logo .name{display:none}
  .mode-tabs button{padding:5px 8px;font-size:10.5px}
  #topbar .element-badge .meta .nm{font-size:11px}
  #topbar .element-badge .sym{font-size:18px}
  #bottombar{flex-wrap:nowrap;overflow-x:auto;padding:6px 8px}
  .ctrl-group{padding-right:6px}
  .ctrl-group .glbl{display:none}
  .icon-btn{width:30px;height:30px}
  .slider-mini{width:60px}
}
@media (max-width:500px){
  #elementGrid{grid-template-columns:repeat(5,1fr)}
  .mode-tabs button{padding:5px 6px;font-size:10px}
  .mode-tabs button .lbl-long{display:none}
  .hud-card{font-size:10px;padding:6px 9px;min-width:110px}
  .setting-row{flex-direction:column;align-items:flex-start;gap:6px}
  .setting-row .ctrl{width:100%}
}
</style>
</head>
<body>

<div id="app">
  <!-- TOP BAR -->
  <header id="topbar">
    <div id="logo">
      <div class="glyph"></div>
      <span class="name">ATOMIC LAB 3D</span>
    </div>
    <div class="element-badge">
      <span class="sym" id="tbSym">H</span>
      <div class="meta">
        <span class="nm" id="tbName">Hydrogen</span>
        <span class="z" id="tbZ">Z = 1</span>
      </div>
    </div>
    <div class="spacer"></div>
    <div class="mode-tabs" id="modeTabs">
      <button data-mode="shell" class="active"><span class="lbl-long">Shell</span><span style="display:none">S</span></button>
      <button data-mode="orbital"><span class="lbl-long">Orbital</span><span style="display:none">O</span></button>
      <button data-mode="cloud"><span class="lbl-long">Cloud</span><span style="display:none">C</span></button>
    </div>
    <button class="top-icon-btn" id="btnScienceNotes" data-tip="Science Notes" aria-label="Science Notes">
      <svg viewBox="0 0 24 24"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>
    </button>
    <button class="top-icon-btn" id="btnFullscreen" data-tip="Fullscreen" aria-label="Fullscreen">
      <svg viewBox="0 0 24 24"><path d="M8 3H5a2 2 0 0 0-2 2v3M21 8V5a2 2 0 0 0-2-2h-3M3 16v3a2 2 0 0 0 2 2h3M16 21h3a2 2 0 0 0 2-2v-3"/></svg>
    </button>
    <button class="top-icon-btn" id="btnSettings" data-tip="Settings" aria-label="Settings">
      <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
    </button>
  </header>

  <!-- LEFT: ELEMENT SELECTOR -->
  <aside id="elementPanel">
    <div class="panel-title">Elements 1 – 20</div>
    <input id="searchBox" type="text" placeholder="Search name or symbol…" />
    <div id="elementGrid"></div>
    <div class="panel-title">Legend</div>
    <div class="legend">
      <div class="row"><span class="dot proton"></span><strong>Proton</strong> (p⁺)</div>
      <div class="row"><span class="dot neutron"></span><strong>Neutron</strong> (n⁰)</div>
      <div class="row"><span class="dot electron"></