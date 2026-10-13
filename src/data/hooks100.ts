// 100 hook formulas in 10 psychological triggers, written for beauty / hair / skin products
// (argan oil, shampoo, serums, creams...). Placeholders: {product} {benefit} {mistake} {number}
//
// `claim: true` = the formula makes a factual claim (stock, deadline, results, experience).
// The UI shows "use only if true" so sellers never publish a claim that isn't real.

export type Trigger = { id: string; name: string; nameEn: string; icon: string; count: number };
export type Formula = { trigger: string; ar: string; en: string; claim?: boolean; example?: string };

export const triggers: Trigger[] = [
  { id: "curiosity", name: "الفضول", nameEn: "Curiosity", icon: "🤫", count: 15 },
  { id: "fomo", name: "الخوف من الفوات", nameEn: "FOMO", icon: "⚠️", count: 10 },
  { id: "social", name: "الدليل الاجتماعي", nameEn: "Social Proof", icon: "👥", count: 10 },
  { id: "scarcity", name: "الندرة", nameEn: "Scarcity", icon: "⏰", count: 10 },
  { id: "authority", name: "السلطة", nameEn: "Authority", icon: "👨‍⚕️", count: 10 },
  { id: "pain", name: "الألم والمشكلة", nameEn: "Pain Point", icon: "😤", count: 10 },
  { id: "transformation", name: "التحول", nameEn: "Transformation", icon: "✨", count: 10 },
  { id: "secret", name: "السر", nameEn: "Secret", icon: "🔓", count: 10 },
  { id: "challenge", name: "التحدي", nameEn: "Challenge", icon: "💪", count: 10 },
  { id: "easy", name: "السهولة", nameEn: "Easy", icon: "😌", count: 5 },
];

const f = (trigger: string, ar: string, en: string, claim = false, example?: string): Formula => ({
  trigger, ar, en, ...(claim ? { claim } : {}), ...(example ? { example } : {}),
});

export const formulas: Formula[] = [
  // ───────── CURIOSITY · الفضول (15) ─────────
  f("curiosity", "لا أحد يخبرك {benefit} بهذه الطريقة", "No one tells you {benefit} like this", false, "لا أحد يخبرك كيف يطول الشعر بهذه الطريقة"),
  f("curiosity", "كنت أفعل {mistake} لسنوات… وهذا ما حدث لشعري", "I did {mistake} for years… and this is what happened"),
  f("curiosity", "ما يحدث عند وضع {product} قبل النوم", "What happens when you use {product} before bed"),
  f("curiosity", "جرّبت كل شيء إلا {product}… والنتيجة؟", "I tried everything except {product}… the result?"),
  f("curiosity", "هذا الفيديو سيغيّر نظرتك إلى {product}", "This video will change how you see {product}"),
  f("curiosity", "لماذا لا يخبرك أحد بهذا عن {product}؟", "Why does no one tell you this about {product}?"),
  f("curiosity", "استعملت {product} لمدة {number} أيام… شاهد ما حصل", "I used {product} for {number} days… watch what happened", true),
  f("curiosity", "كيف تفرّق بين {product} الأصلي والمقلَّد؟", "How to tell real {product} from a fake"),
  f("curiosity", "ما يجب أن تعرفه عن {benefit} قبل الشراء", "What to know about {benefit} before you buy"),
  f("curiosity", "سؤال واحد يكشف هل {product} يناسب بشرتك", "One question reveals if {product} suits your skin"),
  f("curiosity", "كنت أظن أن {product} مجرد دعاية… حتى جرّبته", "I thought {product} was just hype… until I tried it", true),
  f("curiosity", "ما يحدث لشعرك بعد {number} يوم من {product}", "What happens to your hair after {number} days of {product}", true),
  f("curiosity", "هل {product} مناسب للبشرة الحساسة؟ الجواب هنا", "Is {product} OK for sensitive skin? Here's the answer"),
  f("curiosity", "الخطأ الذي يقع فيه كثيرون مع {product}", "The mistake many people make with {product}"),
  f("curiosity", "خلف الكواليس: كيف يُستخلص {product}", "Behind the scenes: how {product} is made"),

  // ───────── FOMO · الخوف من الفوات (10) ─────────
  f("fomo", "توقّفي عن {mistake} فورًا", "Stop {mistake} right now"),
  f("fomo", "إذا كنتِ تفعلين {mistake} فانتبهي لهذا", "If you do {mistake}, watch this"),
  f("fomo", "3 أخطاء تُضعف {benefit} دون أن تشعري", "3 mistakes weakening {benefit} without you noticing"),
  f("fomo", "قبل أن تشتري {product} شاهد هذا", "Before you buy {product}, watch this"),
  f("fomo", "لا تستعمل {product} بهذه الطريقة", "Don't use {product} this way"),
  f("fomo", "هذا ما يفعله {mistake} بشعرك كل يوم", "What {mistake} does to your hair every day"),
  f("fomo", "احذر: علامات {product} المقلَّد", "Beware: signs of a fake {product}"),
  f("fomo", "كلما أجّلتِ {benefit} صار أصعب", "The longer you wait on {benefit}, the harder it gets"),
  f("fomo", "الجميع يتحدث عن {product}… هل فاتك؟", "Everyone's talking about {product}… are you missing out?"),
  f("fomo", "لا تتخطَّ هذه الخطوة قبل {product}", "Don't skip this step before {product}"),

  // ───────── SOCIAL PROOF · الدليل الاجتماعي (10) ─────────
  f("social", "{number} شخص جرّبوا {product}… هذه آراؤهم", "{number} people tried {product}… here's what they said", true),
  f("social", "لماذا انتقل كثيرون إلى {product}؟", "Why are so many people switching to {product}?", true),
  f("social", "آراء حقيقية: هل {product} يستحق الشراء؟", "Real reviews: is {product} worth it?", true),
  f("social", "أكثر ما يسأل عنه الزبائن: {product}", "What customers ask about most: {product}", true),
  f("social", "سألتني صديقاتي عن سرّ {benefit}", "My friends asked me the secret behind my {benefit}", true),
  f("social", "جرّبته أختي أولًا ثم العائلة كلها", "My sister tried it first, then the whole family", true),
  f("social", "تعليقات الزبائن على {product} فاجأتنا", "Customer comments on {product} surprised us", true),
  f("social", "ماذا قالت من استعملت {product} لمدة {number} أسابيع", "What people said after {number} weeks of {product}", true),
  f("social", "لماذا يعود الزبائن لطلب {product} مرة أخرى", "Why customers keep reordering {product}", true),
  f("social", "قبل وبعد: تجربة حقيقية مع {product}", "Before & after: a real experience with {product}", true),

  // ───────── SCARCITY · الندرة (10) ─────────
  f("scarcity", "آخر {number} عبوات من {product}", "Last {number} bottles of {product}", true),
  f("scarcity", "ينتهي العرض بعد {number} ساعة", "Offer ends in {number} hours", true),
  f("scarcity", "{product} يُصنع بكميات صغيرة", "{product} is made in small batches", true),
  f("scarcity", "هذا الموسم فقط: {product} بسعر خاص", "This season only: {product} at a special price", true),
  f("scarcity", "الدفعة القادمة من {product} بعد {number} أسابيع", "Next batch of {product} is {number} weeks away", true),
  f("scarcity", "الكمية محدودة: {number} فقط في المخزون", "Limited: only {number} in stock", true),
  f("scarcity", "السعر سيرتفع بعد {number} أيام", "Price goes up in {number} days", true),
  f("scarcity", "الدفعة الحالية من {product} شارفت على النفاد", "The current batch of {product} is almost gone", true),
  f("scarcity", "بقي {number} فقط… الطلب على {product} كبير", "Only {number} left… {product} is in demand", true),
  f("scarcity", "آخر فرصة لـ{benefit} بهذا السعر", "Last chance for {benefit} at this price", true),

  // ───────── AUTHORITY · السلطة (10) ─────────
  f("authority", "ماذا تسأل طبيب الجلد عن {product}؟", "What to ask your dermatologist about {product}"),
  f("authority", "المكوّن الذي يجب أن تبحث عنه لأجل {benefit}", "The ingredient to look for if you want {benefit}"),
  f("authority", "المكوّنات مشروحة: ما الذي في {product} فعلًا؟", "Ingredients explained: what's really in {product}?"),
  f("authority", "كيف تقرأ ملصق {product} مثل المحترفين", "How to read a {product} label like a pro"),
  f("authority", "الوقت المناسب لاستعمال {product}", "The right time to use {product}"),
  f("authority", "الطريقة الصحيحة لاستخدام {product}", "The right way to use {product}"),
  f("authority", "بعد {number} سنوات في العناية بالبشرة: نصيحتي لـ{benefit}", "After {number} years in skincare: my advice on {benefit}", true),
  f("authority", "لماذا يُنصح بتجربة {product} على منطقة صغيرة أولًا؟", "Why patch-test {product} on a small area first?"),
  f("authority", "المكوّنات الطبيعية في {product} وما تفعله", "The natural ingredients in {product} and what they do"),
  f("authority", "كيف يُصنع {product} ولماذا تهمّ الجودة", "How {product} is made and why quality matters"),

  // ───────── PAIN POINT · الألم والمشكلة (10) ─────────
  f("pain", "تعبت من {mistake}؟ جرّب هذا", "Tired of {mistake}? Try this"),
  f("pain", "شعرك يضعف بسبب {mistake}؟", "Is {mistake} weakening your hair?"),
  f("pain", "لماذا لا يعطيك {product} الرخيص {benefit}", "Why cheap {product} won't give you {benefit}"),
  f("pain", "جرّبت {number} منتجات ولم ينجح شيء؟", "Tried {number} products and nothing worked?"),
  f("pain", "هذا هو السبب الحقيقي لغياب {benefit}", "The real reason you're not getting {benefit}"),
  f("pain", "كم مرة خيّب {product} ظنّك؟", "How many times has {product} let you down?"),
  f("pain", "جفاف، تقصّف، تجعّد… روتين بسيط مع {product}", "Dryness, breakage, frizz… a simple routine with {product}"),
  f("pain", "إذا لم ينجح {product} معك فربما تفعل {mistake}", "If {product} isn't working, you may be doing {mistake}"),
  f("pain", "مللتِ من إخفاء بشرتك بالمكياج؟", "Tired of hiding your skin under makeup?"),
  f("pain", "لماذا يفشل كل {product} تجرّبه؟", "Why does every {product} you try fail?"),

  // ───────── TRANSFORMATION · التحول (10) ─────────
  f("transformation", "من شعر جاف إلى {benefit} في {number} يوم", "From dry hair to {benefit} in {number} days", true),
  f("transformation", "كيف تغيّر شعري مع {product}", "How my hair changed with {product}", true),
  f("transformation", "قبل {product} وبعده: {number} يوم فقط", "Before and after {product}: just {number} days", true),
  f("transformation", "من {mistake} إلى {benefit} — قصتي مع {product}", "From {mistake} to {benefit} — my story with {product}", true),
  f("transformation", "في {number} أيام فقط: ماذا تغيّر؟", "In just {number} days: what changed?", true),
  f("transformation", "كيف ساعدني {product} على استعادة {benefit}", "How {product} helped me get back {benefit}", true),
  f("transformation", "تحوّل البشرة: من الجفاف إلى {benefit}", "Skin glow-up: from dry to {benefit}", true),
  f("transformation", "النتيجة بعد {number} استعمالات لـ{product}", "Results after {number} uses of {product}", true),
  f("transformation", "شاهد الفرق مع {product} بنفسك", "See the difference with {product} yourself"),
  f("transformation", "من الأسبوع الأول: ما لاحظته مع {product}", "From week one: what I noticed with {product}", true),

  // ───────── SECRET · السر (10) ─────────
  f("secret", "سرّ {benefit} الذي لا يعرفه كثيرون", "The {benefit} secret not many people know"),
  f("secret", "سرّ جدّاتنا للعناية بالشعر: {product}", "Our grandmothers' hair secret: {product}"),
  f("secret", "الخطوة السرّية في روتيني: {product}", "The secret step in my routine: {product}", true),
  f("secret", "ما لا يُقال عن {product}", "What nobody says about {product}"),
  f("secret", "سأكشف لكم سرّ {benefit}", "I'm sharing my {benefit} secret"),
  f("secret", "الطريقة التي احتفظت بها لنفسي لـ{benefit}", "The method I kept to myself for {benefit}", true),
  f("secret", "اكتشفت هذا السرّ في {product} صدفة", "I found this {product} secret by accident", true),
  f("secret", "حيلة بسيطة تزيد فائدة {product}", "A simple trick to get more from {product}"),
  f("secret", "وصفة طبيعية سهلة مع {product}", "An easy natural recipe using {product}"),
  f("secret", "سرّ {benefit} ليس غلاء السعر… بل {product}", "The {benefit} secret isn't price… it's {product}"),

  // ───────── CHALLENGE · التحدي (10) ─────────
  f("challenge", "تحدّي {number} يوم مع {product}", "{number}-day {product} challenge"),
  f("challenge", "أتحدّاك أن تجرّب {product} لمدة أسبوع", "I challenge you to try {product} for a week"),
  f("challenge", "هل تستطيع ترك {mistake} لمدة {number} أيام؟", "Can you quit {mistake} for {number} days?"),
  f("challenge", "تحدّي الصور: اليوم الأول مقابل اليوم {number} مع {product}", "Photo challenge: day 1 vs day {number} with {product}"),
  f("challenge", "جرّب {product} مرة واحدة ولاحظ الفرق", "Try {product} once and notice the difference"),
  f("challenge", "اختبار: هل {product} يفي بوعده؟", "Test: does {product} live up to its promise?"),
  f("challenge", "{number} أيام بدون {mistake}: ماذا سيحدث؟", "{number} days without {mistake}: what will happen?"),
  f("challenge", "تحدّي الروتين البسيط: {number} خطوات فقط", "Simple routine challenge: just {number} steps"),
  f("challenge", "هل تلاحظ الفرق بعد {product}؟", "Can you spot the difference after {product}?"),
  f("challenge", "هل تقبل تحدّي {benefit} هذا الشهر؟", "Will you accept the {benefit} challenge this month?"),

  // ───────── EASY · السهولة (5) ─────────
  f("easy", "{benefit} في {number} دقائق فقط", "{benefit} in just {number} minutes", true),
  f("easy", "روتين بسيط: {product} فقط", "A simple routine: just {product}"),
  f("easy", "بدون تعقيد: خطوة واحدة مع {product}", "No fuss: one step with {product}"),
  f("easy", "كل ما تحتاجه {product} وبضع دقائق", "All you need is {product} and a few minutes"),
  f("easy", "أسهل طريقة للحصول على {benefit}", "The easiest way to get {benefit}"),
];
