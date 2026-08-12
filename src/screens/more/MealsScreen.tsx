import { useState, useEffect } from 'react'
import { SubHeader } from '../../components/atoms'

const RECIPES = [
  { name: 'Banana Oatmeal Porridge', time: '5 min', age: '6m+', icon: '🍌', cal: '120 kcal', servings: '1', tags: ['Breakfast', 'Iron-rich'], ingredients: ['½ ripe banana', '3 tbsp rolled oats', '¼ cup breast milk or formula', 'Pinch of cinnamon'], steps: ['Mash the banana thoroughly in a bowl.', 'Cook oats with milk/formula over low heat, stirring for 3 minutes.', 'Stir in mashed banana and cinnamon.', 'Cool to lukewarm before serving.'], tip: 'Add a tiny pinch of nutmeg for variety.' },
  { name: 'Sweet Potato Mash', time: '15 min', age: '4m+', icon: '🍠', cal: '90 kcal', servings: '2', tags: ['Puree', 'Vitamin A'], ingredients: ['1 small sweet potato', '2 tbsp breast milk or water', 'Pinch of turmeric (optional)'], steps: ['Peel and cube the sweet potato.', 'Steam for 12–15 minutes until fork-tender.', 'Blend with milk or water until smooth.', 'Thin with extra liquid to desired consistency.'], tip: 'Freeze in ice cube trays for up to 3 months.' },
  { name: 'Avocado Toast Fingers', time: '5 min', age: '8m+', icon: '🥑', cal: '150 kcal', servings: '1', tags: ['BLW', 'Healthy fats'], ingredients: ['¼ ripe avocado', '1 slice soft wholegrain bread', 'Squeeze of lemon juice', 'Pinch of mild cumin'], steps: ['Toast bread lightly then cut into finger strips.', 'Mash avocado with lemon and cumin.', 'Spread evenly on each finger strip.', 'Serve immediately.'], tip: 'Great for baby-led weaning — the strips are easy to grip.' },
]


function RecipeDetailSheet({ recipe, onClose }: {
  recipe: typeof RECIPES[0]
  onClose: () => void
}) {
  const [saved, setSaved] = useState(false)
  return (
    <div className="absolute inset-0 z-50 flex flex-col justify-end">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[3px]" onClick={onClose} />
      <div className="relative z-10 rounded-t-3xl flex flex-col"
        style={{ background: '#FFFCFA', boxShadow: '0 -12px 48px rgba(0,0,0,0.14)', maxHeight: '88%' }}>
        <div className="flex-shrink-0 px-5 pt-4 pb-3">
          <div className="w-10 h-1 rounded-full bg-[#E0D8D4] mx-auto mb-4" />
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0"
              style={{ background: '#FFD6C9' }}>{recipe.icon}</div>
            <div className="flex-1 min-w-0">
              <h3 className="font-display text-lg text-[#242424] leading-tight">{recipe.name}</h3>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <span className="text-xs text-[#6E6E73]">⏱ {recipe.time}</span>
                <span className="text-xs text-[#6E6E73]">·</span>
                <span className="text-xs text-[#6E6E73]">👶 {recipe.age}</span>
                <span className="text-xs text-[#6E6E73]">·</span>
                <span className="text-xs text-[#6E6E73]">🔥 {recipe.cal}</span>
              </div>
            </div>
            <button onClick={() => setSaved(v => !v)}
              className="action-btn w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
              style={saved ? { background: '#FFD6C9', border: '1.5px solid #EE674E' } : { background: '#F0E8E4', border: '1.5px solid #E0D8D4' }}>
              <span className="text-base">{saved ? '❤️' : '🤍'}</span>
            </button>
          </div>
          <div className="flex gap-2 mt-3 flex-wrap">
            {recipe.tags.map(t => (
              <span key={t} className="text-[11px] font-semibold px-2.5 py-1 rounded-full"
                style={{ background: '#FFD6C9', color: '#EE674E' }}>{t}</span>
            ))}
          </div>
        </div>
        <div className="scroll-area flex-1 px-5 pb-4 space-y-4">
          <div className="glass-card rounded-2xl p-4">
            <p className="text-xs font-bold text-[#6E6E73] uppercase tracking-wide mb-3">Ingredients <span className="font-normal normal-case text-[#B0A8A4]">({recipe.servings} serving)</span></p>
            <div className="space-y-2">
              {recipe.ingredients.map((ing, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#EE674E] flex-shrink-0" />
                  <p className="text-sm text-[#242424]">{ing}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="glass-card rounded-2xl p-4">
            <p className="text-xs font-bold text-[#6E6E73] uppercase tracking-wide mb-3">Instructions</p>
            <div className="space-y-3">
              {recipe.steps.map((step, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0 mt-0.5"
                    style={{ background: 'linear-gradient(135deg,#EE674E,#F47B66)' }}>{i + 1}</div>
                  <p className="text-sm text-[#242424] leading-relaxed flex-1">{step}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-2xl px-4 py-3" style={{ background: '#FEF3CD', border: '1.5px solid #F8C85E' }}>
            <p className="text-xs text-[#7A6010]">💡 <span className="font-semibold">Tip:</span> {recipe.tip}</p>
          </div>
        </div>
        <div className="flex-shrink-0 px-5 pb-6 pt-3 border-t border-[#F0E8E4]">
          <button onClick={onClose}
            className="action-btn w-full py-3.5 rounded-2xl font-bold text-white"
            style={{ background: 'linear-gradient(135deg,#EE674E,#F47B66)', border: '2px solid #C94930', boxShadow: '0 4px 0 #C94930' }}>
            Got it!
          </button>
        </div>
      </div>
    </div>
  )
}


function AddFoodSheet({ onClose, onAdd }: { onClose: () => void; onAdd: (food: string) => void }) {
  const suggestions = ['🍓 Strawberry', '🫛 Peas', '🍑 Peach', '🌽 Corn', '🍇 Grape', '🥝 Kiwi', '🥩 Beef', '🐟 Salmon', '🧀 Cheese', '🫐 Blackberry']
  const [input, setInput] = useState('')
  const [added, setAdded] = useState<string[]>([])

  const addFood = (f: string) => {
    if (!added.includes(f)) setAdded(a => [...a, f])
  }
  const removeAdded = (f: string) => setAdded(a => a.filter(x => x !== f))

  const handleSave = () => {
    added.forEach(f => onAdd(f))
    onClose()
  }

  return (
    <div className="absolute inset-0 z-50 flex flex-col justify-end">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[3px]" onClick={onClose} />
      <div className="relative z-10 rounded-t-3xl flex flex-col"
        style={{ background: '#FFFCFA', boxShadow: '0 -12px 48px rgba(0,0,0,0.14)', maxHeight: '80%' }}>
        <div className="flex-shrink-0 px-5 pt-4 pb-3">
          <div className="w-10 h-1 rounded-full bg-[#E0D8D4] mx-auto mb-4" />
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl" style={{ background: '#FFD6C9' }}>🥦</div>
            <div>
              <h3 className="font-display text-lg text-[#242424]">Add Food</h3>
              <p className="text-xs text-[#6E6E73]">Track what Maya has tried</p>
            </div>
          </div>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-base">🔍</span>
            <input value={input} onChange={e => setInput(e.target.value)}
              placeholder="Type a food name..."
              className="cartoon-input w-full pl-11 pr-4 py-3 text-sm text-[#242424] placeholder-[#C0B8B4]" />
            {input.trim() && (
              <button onClick={() => { addFood('🍽️ ' + input.trim()); setInput('') }}
                className="absolute right-3 top-1/2 -translate-y-1/2 action-btn px-3 py-1.5 rounded-lg text-xs font-bold text-white"
                style={{ background: 'linear-gradient(135deg,#EE674E,#F47B66)' }}>
                Add
              </button>
            )}
          </div>
        </div>
        <div className="scroll-area flex-1 px-5 pb-4 space-y-4">
          {added.length > 0 && (
            <div>
              <p className="text-xs font-bold text-[#6E6E73] uppercase tracking-wide mb-2">Adding</p>
              <div className="flex flex-wrap gap-2">
                {added.map(f => (
                  <button key={f} onClick={() => removeAdded(f)}
                    className="action-btn flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium"
                    style={{ background: '#FFD6C9', border: '1.5px solid #EE674E', color: '#EE674E' }}>
                    {f} <span className="text-xs">✕</span>
                  </button>
                ))}
              </div>
            </div>
          )}
          <div>
            <p className="text-xs font-bold text-[#6E6E73] uppercase tracking-wide mb-2">Suggestions</p>
            <div className="flex flex-wrap gap-2">
              {suggestions.filter(s => !added.includes(s) && s.toLowerCase().includes(input.toLowerCase())).map(s => (
                <button key={s} onClick={() => addFood(s)}
                  className="action-btn px-3 py-1.5 rounded-full text-sm font-medium text-[#242424]"
                  style={{ background: '#F8F4F2', border: '1.5px solid #F0E8E4' }}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="flex-shrink-0 px-5 pb-6 pt-3 flex gap-3 border-t border-[#F0E8E4]">
          <button onClick={onClose}
            className="action-btn flex-1 py-3 rounded-2xl font-semibold text-sm text-[#6E6E73]"
            style={{ background: '#F0E8E4', border: '2px solid #E0D8D4' }}>
            Cancel
          </button>
          <button onClick={handleSave} disabled={added.length === 0}
            className="action-btn flex-1 py-3 rounded-2xl font-bold text-sm text-white"
            style={added.length === 0
              ? { background: '#F6B6A5', border: '2px solid #E8A090', boxShadow: '0 3px 0 #E8A090' }
              : { background: 'linear-gradient(135deg,#EE674E,#F47B66)', border: '2px solid #C94930', boxShadow: '0 4px 0 #C94930' }}>
            Save {added.length > 0 ? `(${added.length})` : ''}
          </button>
        </div>
      </div>
    </div>
  )
}


function AIMealPlanSheet({ onClose }: { onClose: () => void }) {
  const [loading, setLoading] = useState(true)
  const [accepted, setAccepted] = useState(false)
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  const plan = [
    ['🍌 Banana Oatmeal', '🍗 Chicken Puree', '🥕 Carrot Mash'],
    ['🥑 Avocado Toast', '🐟 Salmon Flakes', '🍠 Sweet Potato'],
    ['🍳 Scrambled Egg', '🫛 Pea Puree', '🫐 Blueberry Yogurt'],
    ['🍌 Banana Pancake', '🥩 Beef Mash', '🥦 Broccoli Bites'],
    ['🍓 Berry Smoothie', '🧀 Cheese Toast', '🥑 Avocado Mash'],
    ['🍳 Omelette Strips', '🍗 Chicken Strips', '🍠 Sweet Potato Fries'],
    ['🥝 Kiwi Puree', '🐟 Fish Cake', '🌽 Corn Chowder'],
  ]
  useEffect(() => { const t = setTimeout(() => setLoading(false), 1800); return () => clearTimeout(t) }, [])
  return (
    <div className="absolute inset-0 z-50 flex flex-col justify-end">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[3px]" onClick={onClose} />
      <div className="relative z-10 rounded-t-3xl flex flex-col"
        style={{ background: '#FFFCFA', boxShadow: '0 -12px 48px rgba(0,0,0,0.14)', maxHeight: '88%' }}>
        <div className="flex-shrink-0 px-5 pt-4 pb-3">
          <div className="w-10 h-1 rounded-full bg-[#E0D8D4] mx-auto mb-4" />
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 coral-gradient rounded-xl flex items-center justify-center text-xl">✨</div>
            <div>
              <h3 className="font-display text-lg text-[#242424]">AI Meal Plan</h3>
              <p className="text-xs text-[#6E6E73]">Personalised for Maya · This week</p>
            </div>
          </div>
        </div>
        <div className="scroll-area flex-1 px-5 pb-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-4">
              <div className="w-16 h-16 rounded-full coral-gradient flex items-center justify-center ai-orb-pulse">
                <span className="text-2xl">✨</span>
              </div>
              <div className="text-center">
                <p className="font-semibold text-[#242424]">Planning Maya's week...</p>
                <p className="text-xs text-[#6E6E73] mt-1">Considering age, tried foods & nutrition</p>
              </div>
              <div className="flex gap-1.5">
                {[0,1,2].map(i => (
                  <div key={i} className="w-2 h-2 rounded-full bg-[#EE674E]"
                    style={{ animation: `waveform 0.8s ease-in-out infinite ${i * 0.2}s` }} />
                ))}
              </div>
            </div>
          ) : accepted ? (
            <div className="flex flex-col items-center justify-center py-10 gap-4">
              <div className="w-20 h-20 rounded-full bg-[#E6F4ED] flex items-center justify-center text-4xl pop-in">✅</div>
              <div className="text-center">
                <p className="font-display text-xl text-[#242424]">Plan saved!</p>
                <p className="text-sm text-[#6E6E73] mt-1">Maya's week is all planned out 🎉</p>
              </div>
              <button onClick={onClose}
                className="action-btn w-full py-3.5 rounded-2xl font-bold text-white mt-2"
                style={{ background: 'linear-gradient(135deg,#EE674E,#F47B66)', border: '2px solid #C94930', boxShadow: '0 4px 0 #C94930' }}>
                Done
              </button>
            </div>
          ) : (
            <div className="space-y-3 pt-1">
              <div className="rounded-2xl px-4 py-3" style={{ background: '#FEF3CD', border: '1.5px solid #F8C85E' }}>
                <p className="text-xs text-[#7A6010]">✨ Based on Maya's tried foods, age, and nutritional balance</p>
              </div>
              {days.map((day, i) => (
                <div key={day} className="glass-card rounded-2xl p-3.5">
                  <p className="text-xs font-bold text-[#EE674E] mb-2">{day}</p>
                  <div className="space-y-1.5">
                    {['Breakfast', 'Lunch', 'Dinner'].map((meal, j) => (
                      <div key={meal} className="flex items-center gap-2">
                        <p className="text-[10px] text-[#B0A8A4] w-14 flex-shrink-0">{meal}</p>
                        <p className="text-sm text-[#242424]">{plan[i][j]}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        {!loading && !accepted && (
          <div className="flex-shrink-0 px-5 pb-6 pt-3 flex gap-3 border-t border-[#F0E8E4]">
            <button onClick={onClose}
              className="action-btn flex-1 py-3 rounded-2xl font-semibold text-sm text-[#6E6E73]"
              style={{ background: '#F0E8E4', border: '2px solid #E0D8D4' }}>
              Regenerate
            </button>
            <button onClick={() => setAccepted(true)}
              className="action-btn flex-1 py-3 rounded-2xl font-bold text-sm text-white"
              style={{ background: 'linear-gradient(135deg,#EE674E,#F47B66)', border: '2px solid #C94930', boxShadow: '0 4px 0 #C94930' }}>
              Accept Plan ✓
            </button>
          </div>
        )}
      </div>
    </div>
  )
}


function GroceryListSheet({ onClose }: { onClose: () => void }) {
  const categories = [
    { label: 'Fruits', icon: '🍎', items: ['Banana ×3', 'Avocado ×2', 'Blueberries ×1 punnet', 'Strawberries ×1 punnet'] },
    { label: 'Vegetables', icon: '🥦', items: ['Sweet potato ×2', 'Carrots ×4', 'Broccoli ×1 head', 'Peas (frozen) ×1 bag'] },
    { label: 'Protein', icon: '🍗', items: ['Chicken breast ×2', 'Salmon fillet ×1', 'Eggs ×6'] },
    { label: 'Pantry', icon: '🫙', items: ['Rolled oats ×1 pack', 'Whole grain bread ×1 loaf'] },
    { label: 'Dairy', icon: '🧀', items: ['Mild cheddar ×1 block', 'Full-fat yogurt ×1 pot'] },
  ]
  const [checked, setChecked] = useState<string[]>([])
  const [copied, setCopied] = useState(false)

  const toggle = (item: string) => setChecked(c => c.includes(item) ? c.filter(x => x !== item) : [...c, item])
  const total = categories.reduce((s, c) => s + c.items.length, 0)

  return (
    <div className="absolute inset-0 z-50 flex flex-col justify-end">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[3px]" onClick={onClose} />
      <div className="relative z-10 rounded-t-3xl flex flex-col"
        style={{ background: '#FFFCFA', boxShadow: '0 -12px 48px rgba(0,0,0,0.14)', maxHeight: '88%' }}>
        <div className="flex-shrink-0 px-5 pt-4 pb-3">
          <div className="w-10 h-1 rounded-full bg-[#E0D8D4] mx-auto mb-4" />
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl" style={{ background: '#E6F4ED' }}>🛒</div>
            <div className="flex-1">
              <h3 className="font-display text-lg text-[#242424]">Grocery List</h3>
              <p className="text-xs text-[#6E6E73]">{checked.length} of {total} items checked</p>
            </div>
            <button onClick={() => { setCopied(true); setTimeout(() => setCopied(false), 1600) }}
              className="action-btn px-3 py-2 rounded-xl text-xs font-bold"
              style={copied ? { background: '#E6F4ED', color: '#55A67A', border: '1.5px solid #A8D9BC' } : { background: '#FFD6C9', color: '#EE674E', border: '1.5px solid #F6B6A5' }}>
              {copied ? '✅ Copied' : '📋 Copy'}
            </button>
          </div>
          {/* Progress bar */}
          <div className="mt-3 h-2 rounded-full bg-[#F0E8E4] overflow-hidden">
            <div className="h-full rounded-full transition-all duration-300"
              style={{ width: `${(checked.length / total) * 100}%`, background: 'linear-gradient(90deg,#EE674E,#55A67A)' }} />
          </div>
        </div>
        <div className="scroll-area flex-1 px-5 pb-4 space-y-3">
          {categories.map(cat => (
            <div key={cat.label} className="glass-card rounded-2xl overflow-hidden">
              <div className="px-4 py-2.5 flex items-center gap-2" style={{ background: '#F8F4F2' }}>
                <span className="text-base">{cat.icon}</span>
                <p className="text-xs font-bold text-[#6E6E73] uppercase tracking-wide">{cat.label}</p>
              </div>
              <div className="divide-y divide-[#F0E8E4]">
                {cat.items.map(item => {
                  const done = checked.includes(item)
                  return (
                    <div key={item} className="flex items-center gap-3 px-3 py-2.5">
                      {/* Standalone checkbox button — large tap target */}
                      <button
                        onClick={() => toggle(item)}
                        className="flex-shrink-0 flex items-center justify-center transition-all"
                        style={{
                          width: 32, height: 32, borderRadius: 10,
                          background: done ? '#55A67A' : '#fff',
                          border: `2.5px solid ${done ? '#3D8A60' : '#F6B6A5'}`,
                          boxShadow: done ? '0 3px 0 #3D8A60' : '0 3px 0 #F0E0D8',
                          transform: done ? 'translateY(2px)' : 'translateY(0)',
                        }}>
                        {done
                          ? <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2.5 7l3 3L11.5 4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                          : <div style={{ width: 8, height: 8, borderRadius: 2, background: '#F6B6A5', opacity: 0.5 }} />
                        }
                      </button>
                      {/* Row label — also toggles on tap */}
                      <button onClick={() => toggle(item)} className="flex-1 text-left py-0.5">
                        <p className={`text-sm transition-all ${done ? 'line-through text-[#B0A8A4]' : 'text-[#242424] font-medium'}`}>{item}</p>
                      </button>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
        <div className="flex-shrink-0 px-5 pb-6 pt-3 border-t border-[#F0E8E4]">
          <button onClick={onClose}
            className="action-btn w-full py-3.5 rounded-2xl font-bold text-white"
            style={{ background: 'linear-gradient(135deg,#55A67A,#78C49A)', border: '2px solid #3D8A60', boxShadow: '0 4px 0 #3D8A60' }}>
            Done Shopping 🛒
          </button>
        </div>
      </div>
    </div>
  )
}


export function ToddlerMealsSubScreen({ onBack }: { onBack: () => void }) {
  const [tab, setTab] = useState<'today' | 'tried' | 'recipes'>('today')
  const [meals, setMeals] = useState([
    { meal: 'Breakfast', food: 'Banana Oatmeal', icon: '🍌', eaten: true },
    { meal: 'Lunch', food: 'Chicken + Sweet Potato', icon: '🍗', eaten: true },
    { meal: 'Dinner', food: 'Avocado Pasta', icon: '🥑', eaten: false },
  ])
  const [triedFoods, setTriedFoods] = useState(['🍌 Banana', '🥑 Avocado', '🍗 Chicken', '🥕 Carrot', '🍠 Sweet Potato', '🫐 Blueberry', '🥦 Broccoli', '🍳 Egg'])
  const [activeRecipe, setActiveRecipe] = useState<typeof RECIPES[0] | null>(null)
  const [showAddFood, setShowAddFood] = useState(false)
  const [showAIPlan, setShowAIPlan] = useState(false)
  const [showGrocery, setShowGrocery] = useState(false)

  const toggleEaten = (i: number) => setMeals(m => m.map((meal, idx) => idx === i ? { ...meal, eaten: !meal.eaten } : meal))

  return (
    <>
    <div className="flex flex-col flex-1 overflow-hidden slide-up">
      <SubHeader title="Toddler Meals" onBack={onBack} />
      <div className="flex gap-1 mx-4 bg-[#F6EDE8] p-1 rounded-xl mb-1">
        {(['today', 'tried', 'recipes'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`tab-pill flex-1 py-1.5 rounded-lg text-xs font-semibold capitalize ${tab === t ? 'bg-white text-[#EE674E] shadow-sm' : 'text-[#6E6E73]'}`}>
            {t === 'today' ? "Today's Plan" : t === 'tried' ? 'Foods Tried' : 'Recipes'}
          </button>
        ))}
      </div>
      <div className="scroll-area flex-1 px-4 pb-6 mt-3 space-y-3">
        {tab === 'today' && (<>
          {meals.map((m, i) => (
            <button key={i} onClick={() => toggleEaten(i)}
              className="action-btn w-full glass-card rounded-2xl p-3.5 flex items-center gap-3 text-left">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                style={{ background: m.eaten ? '#E6F4ED' : '#F0E8E4' }}>{m.icon}</div>
              <div className="flex-1">
                <p className="text-xs text-[#6E6E73]">{m.meal}</p>
                <p className="font-semibold text-sm text-[#242424]">{m.food}</p>
              </div>
              <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 transition-all"
                style={m.eaten ? { background: '#E6F4ED', border: '2px solid #A8D9BC' } : { background: 'white', border: '2px solid #F6B6A5' }}>
                {m.eaten && <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="#55A67A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
              </div>
            </button>
          ))}
          <button onClick={() => setShowAIPlan(true)}
            className="action-btn w-full py-3.5 rounded-2xl font-bold text-sm text-white"
            style={{ background: 'linear-gradient(135deg,#EE674E,#F47B66)', border: '2px solid #C94930', boxShadow: '0 4px 0 #C94930' }}>
            ✨ Plan This Week with AI
          </button>
          <button onClick={() => setShowGrocery(true)}
            className="action-btn w-full py-3 rounded-2xl font-bold text-sm text-[#55A67A]"
            style={{ background: '#E6F4ED', border: '2px solid #A8D9BC', boxShadow: '0 3px 0 #A8D9BC' }}>
            🛒 Generate Grocery List
          </button>
        </>)}

        {tab === 'tried' && (
          <div className="glass-card rounded-2xl p-4">
            <p className="text-xs font-bold text-[#6E6E73] uppercase tracking-wide mb-3">Foods Maya Has Tried</p>
            <div className="flex flex-wrap gap-2">
              {triedFoods.map((f, i) => (
                <span key={i} className="px-3 py-1.5 rounded-full text-sm font-medium text-[#242424]"
                  style={{ background: '#FFD6C9' }}>{f}</span>
              ))}
              <button onClick={() => setShowAddFood(true)}
                className="action-btn px-3 py-1.5 rounded-full text-sm font-semibold text-[#EE674E]"
                style={{ background: '#FFF3EE', border: '1.5px dashed #F6B6A5' }}>
                + Add Food
              </button>
            </div>
          </div>
        )}

        {tab === 'recipes' && (
          <div className="space-y-2">
            {RECIPES.map((r, i) => (
              <button key={i} onClick={() => setActiveRecipe(r)}
                className="action-btn w-full glass-card rounded-2xl p-3.5 flex items-center gap-3 text-left">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                  style={{ background: '#FFD6C9' }}>{r.icon}</div>
                <div className="flex-1">
                  <p className="font-semibold text-sm text-[#242424]">{r.name}</p>
                  <p className="text-xs text-[#6E6E73]">⏱ {r.time} · {r.age}</p>
                </div>
                <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: '#FFD6C9' }}>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M5 3l4 4-4 4" stroke="#EE674E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>

    {activeRecipe && <RecipeDetailSheet recipe={activeRecipe} onClose={() => setActiveRecipe(null)} />}
    {showAddFood && <AddFoodSheet onClose={() => setShowAddFood(false)} onAdd={f => setTriedFoods(t => [...t, f])} />}
    {showAIPlan && <AIMealPlanSheet onClose={() => setShowAIPlan(false)} />}
    {showGrocery && <GroceryListSheet onClose={() => setShowGrocery(false)} />}
    </>
  )
}
