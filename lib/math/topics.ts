export interface Topic {
  day: number
  title: string
  area: 'number' | 'algebra' | 'geometry' | 'statistics' | 'sequences' | 'transformation'
}

// Grade 8 — MYP Year 3
export const YEAR8_TOPICS: Topic[] = [
  { day: 1,  title: 'Place value & rounding',              area: 'number' },
  { day: 2,  title: 'Decimal to Percentage',               area: 'number' },
  { day: 3,  title: 'Fraction of amount',                  area: 'number' },
  { day: 4,  title: 'Positive & Negative numbers',         area: 'number' },
  { day: 5,  title: 'LCM / HCF',                          area: 'number' },
  { day: 6,  title: 'Square & prime numbers',              area: 'number' },
  { day: 7,  title: 'Ratio',                               area: 'number' },
  { day: 8,  title: 'Proportion',                          area: 'number' },
  { day: 9,  title: 'Constructing expressions & formulae', area: 'algebra' },
  { day: 10, title: 'Laws of arithmetic & BODMAS',         area: 'algebra' },
  { day: 11, title: 'Collecting like terms',               area: 'algebra' },
  { day: 12, title: 'Expanding single brackets',           area: 'algebra' },
  { day: 13, title: 'Solving equations (find x)',          area: 'algebra' },
  { day: 14, title: 'Inequalities & number line',          area: 'algebra' },
  { day: 15, title: 'Term-to-term rules',                  area: 'sequences' },
  { day: 16, title: 'nth term',                            area: 'sequences' },
  { day: 17, title: 'Function machine (input/output)',     area: 'sequences' },
  { day: 18, title: 'Probability scale',                   area: 'statistics' },
  { day: 19, title: 'Two-way tables & bar charts',         area: 'statistics' },
  { day: 20, title: 'Representing & interpreting data',    area: 'statistics' },
  { day: 21, title: 'Functions y = mx + c',                area: 'algebra' },
  { day: 22, title: 'Graphs of functions',                 area: 'algebra' },
  { day: 23, title: 'Lines parallel to x / y axis',       area: 'algebra' },
  { day: 24, title: 'Translation',                         area: 'transformation' },
  { day: 25, title: 'Reflection',                          area: 'transformation' },
  { day: 26, title: 'Rotation',                            area: 'transformation' },
  { day: 27, title: 'Enlargement',                         area: 'transformation' },
  { day: 28, title: 'Angles: 360° sum & quadrilateral',    area: 'geometry' },
  { day: 29, title: 'Symmetry 2D / Parts of circle',      area: 'geometry' },
  { day: 30, title: 'Congruent shapes + Synthesis',        area: 'geometry' },
]

// Grade 9 — MYP Year 4 / Pre-IGCSE
export const YEAR9_TOPICS: Topic[] = [
  { day: 1,  title: 'Powers, roots & standard form',       area: 'number' },
  { day: 2,  title: 'Percentages & reverse percentage',    area: 'number' },
  { day: 3,  title: 'Fractions, decimals & rounding',      area: 'number' },
  { day: 4,  title: 'Direct & inverse proportion',         area: 'number' },
  { day: 5,  title: 'Expanding double brackets',           area: 'algebra' },
  { day: 6,  title: 'Factorising expressions',             area: 'algebra' },
  { day: 7,  title: 'Linear equations & word problems',    area: 'algebra' },
  { day: 8,  title: 'Simultaneous equations (intro)',      area: 'algebra' },
  { day: 9,  title: 'Changing the subject of a formula',   area: 'algebra' },
  { day: 10, title: 'Inequalities & number line',          area: 'algebra' },
  { day: 11, title: 'Sequences: nth term',                 area: 'sequences' },
  { day: 12, title: 'Geometric sequences',                 area: 'sequences' },
  { day: 13, title: 'Gradient & y = mx + c',               area: 'algebra' },
  { day: 14, title: 'Plotting & reading graphs',           area: 'algebra' },
  { day: 15, title: 'Distance–time & speed–time graphs',   area: 'algebra' },
  { day: 16, title: 'Pythagoras theorem',                  area: 'geometry' },
  { day: 17, title: 'Trigonometry: SOH CAH TOA',           area: 'geometry' },
  { day: 18, title: 'Angle properties & parallel lines',   area: 'geometry' },
  { day: 19, title: 'Area & perimeter of 2D shapes',       area: 'geometry' },
  { day: 20, title: 'Volume & surface area of 3D shapes',  area: 'geometry' },
  { day: 21, title: 'Transformations review',              area: 'transformation' },
  { day: 22, title: 'Similarity & congruence',             area: 'geometry' },
  { day: 23, title: 'Probability: single events',          area: 'statistics' },
  { day: 24, title: 'Probability: combined events',        area: 'statistics' },
  { day: 25, title: 'Mean, median, mode, range',           area: 'statistics' },
  { day: 26, title: 'Frequency tables & histograms',       area: 'statistics' },
  { day: 27, title: 'Scatter diagrams & correlation',      area: 'statistics' },
  { day: 28, title: 'Circle: area, circumference, arcs',   area: 'geometry' },
  { day: 29, title: 'Sets & Venn diagrams (intro)',        area: 'statistics' },
  { day: 30, title: 'Pre-IGCSE Synthesis Review',          area: 'algebra' },
]

// Grade 10 — IGCSE Year 1
export const YEAR10_TOPICS: Topic[] = [
  { day: 1,  title: '2.1 Substitution',                          area: 'algebra' },
  { day: 2,  title: '2.2 Two pairs of brackets',                 area: 'algebra' },
  { day: 3,  title: '2.2 Three pairs of brackets',               area: 'algebra' },
  { day: 4,  title: '2.3 Linear equations with brackets',        area: 'algebra' },
  { day: 5,  title: '2.3 Equations involving fractions',         area: 'algebra' },
  { day: 6,  title: '2.4 Problems solved by linear equations',   area: 'algebra' },
  { day: 7,  title: '2.5 Simultaneous equations — substitution', area: 'algebra' },
  { day: 8,  title: '2.5 Simultaneous equations — elimination',  area: 'algebra' },
  { day: 9,  title: '2.6 Problems by simultaneous equations',    area: 'algebra' },
  { day: 10, title: '6.1 Basic factorisation',                   area: 'algebra' },
  { day: 11, title: '6.1 Group factorisation',                   area: 'algebra' },
  { day: 12, title: '6.1 Quadratic — leading coeff = 1',        area: 'algebra' },
  { day: 13, title: '6.1 Quadratic — leading coeff ≠ 1',        area: 'algebra' },
  { day: 14, title: '6.2 Solving quadratics by factorisation',   area: 'algebra' },
  { day: 15, title: '6.3 Quadratic formula',                     area: 'algebra' },
  { day: 16, title: '6.4 Completing the square',                 area: 'algebra' },
  { day: 17, title: '6.5 Algebraic fractions — simplify',       area: 'algebra' },
  { day: 18, title: '6.5 Algebraic fractions — add/subtract',   area: 'algebra' },
  { day: 19, title: '6.6 Functions: domain & range',             area: 'algebra' },
  { day: 20, title: '6.6 Composite & inverse functions',         area: 'algebra' },
  { day: 21, title: '6.7 Linear inequalities',                   area: 'algebra' },
  { day: 22, title: '6.8 Quadratic inequalities',                area: 'algebra' },
  { day: 23, title: '6.9 Index notation & laws',                 area: 'algebra' },
  { day: 24, title: '6.10 Surds — simplify & rationalise',      area: 'algebra' },
  { day: 25, title: '7.1 Coordinate geometry — distance & midpoint', area: 'geometry' },
  { day: 26, title: '7.2 Gradient & equation of a line',        area: 'geometry' },
  { day: 27, title: '7.3 Parallel & perpendicular lines',       area: 'geometry' },
  { day: 28, title: '7.4 Pythagoras theorem',                    area: 'geometry' },
  { day: 29, title: '7.5 Trigonometry — SOH CAH TOA',           area: 'geometry' },
  { day: 30, title: 'Chapter 2 & 6 Synthesis Review',           area: 'algebra' },
]

// Grade 11 — IGCSE Year 2 (Exam Year)
export const YEAR11_TOPICS: Topic[] = [
  { day: 1,  title: '3.1 Sets & Venn diagrams',                  area: 'statistics' },
  { day: 2,  title: '3.2 Probability: single events',            area: 'statistics' },
  { day: 3,  title: '3.3 Probability: combined events',          area: 'statistics' },
  { day: 4,  title: '3.4 Tree diagrams & conditional prob.',     area: 'statistics' },
  { day: 5,  title: '4.1 Mean, median, mode & range',            area: 'statistics' },
  { day: 6,  title: '4.2 Frequency tables & grouped data',       area: 'statistics' },
  { day: 7,  title: '4.3 Cumulative frequency & box plots',      area: 'statistics' },
  { day: 8,  title: '4.4 Histograms with unequal intervals',     area: 'statistics' },
  { day: 9,  title: '4.5 Scatter diagrams & lines of best fit',  area: 'statistics' },
  { day: 10, title: '5.1 Vectors — notation & column form',      area: 'geometry' },
  { day: 11, title: '5.2 Vector addition & scalar multiplication',area: 'geometry' },
  { day: 12, title: '5.3 Vector geometry & proof',               area: 'geometry' },
  { day: 13, title: '8.1 Circle theorems I',                     area: 'geometry' },
  { day: 14, title: '8.2 Circle theorems II',                    area: 'geometry' },
  { day: 15, title: '8.3 Tangents & angle in semicircle',        area: 'geometry' },
  { day: 16, title: '9.1 Sine rule',                             area: 'geometry' },
  { day: 17, title: '9.2 Cosine rule',                           area: 'geometry' },
  { day: 18, title: '9.3 Area of triangle = ½ab sin C',         area: 'geometry' },
  { day: 19, title: '9.4 3D trigonometry problems',              area: 'geometry' },
  { day: 20, title: '10.1 Similar shapes — area & volume',      area: 'geometry' },
  { day: 21, title: '10.2 Volume of cone, sphere, pyramid',      area: 'geometry' },
  { day: 22, title: '11.1 Differentiation — gradient of curve',  area: 'algebra' },
  { day: 23, title: '11.2 Turning points (max/min)',             area: 'algebra' },
  { day: 24, title: '11.3 Kinematics (v = ds/dt)',               area: 'algebra' },
  { day: 25, title: '12.1 Matrices — operations',                area: 'algebra' },
  { day: 26, title: '12.2 Determinant & inverse matrix',         area: 'algebra' },
  { day: 27, title: '12.3 Solving equations with matrices',      area: 'algebra' },
  { day: 28, title: 'IGCSE Paper 1 style — mixed topics',       area: 'number' },
  { day: 29, title: 'IGCSE Paper 2 style — extended problems',  area: 'algebra' },
  { day: 30, title: 'Full IGCSE Mock Review',                    area: 'algebra' },
]

export function getTopics(grade: 8 | 9 | 10 | 11): Topic[] {
  if (grade === 8)  return YEAR8_TOPICS
  if (grade === 9)  return YEAR9_TOPICS
  if (grade === 10) return YEAR10_TOPICS
  return YEAR11_TOPICS
}

export function getTopic(grade: 8 | 9 | 10 | 11, day: number): Topic | undefined {
  return getTopics(grade).find((t) => t.day === day)
}
