export interface Topic {
  day: number
  title: string
  area: 'number' | 'algebra' | 'geometry' | 'statistics' | 'sequences' | 'transformation'
}

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
  { day: 21, title: 'Functions y = mx + c',                area: 'statistics' },
  { day: 22, title: 'Graphs of functions',                 area: 'statistics' },
  { day: 23, title: 'Lines parallel to x / y axis',       area: 'statistics' },
  { day: 24, title: 'Translation',                         area: 'transformation' },
  { day: 25, title: 'Reflection',                          area: 'transformation' },
  { day: 26, title: 'Rotation',                            area: 'transformation' },
  { day: 27, title: 'Enlargement',                         area: 'transformation' },
  { day: 28, title: 'Angles: 360° sum & quadrilateral',    area: 'geometry' },
  { day: 29, title: 'Symmetry 2D / Parts of circle',      area: 'geometry' },
  { day: 30, title: 'Congruent shapes + Synthesis',        area: 'geometry' },
]

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

export function getTopics(grade: 8 | 10): Topic[] {
  return grade === 8 ? YEAR8_TOPICS : YEAR10_TOPICS
}

export function getTopic(grade: 8 | 10, day: number): Topic | undefined {
  return getTopics(grade).find((t) => t.day === day)
}
