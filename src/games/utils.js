// ══════════════════════════════════════════════════════
//                    SHARED UTILITIES
// ══════════════════════════════════════════════════════

export const R = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a;
export const pick = (a) => a[R(0, a.length - 1)];
export const shuf = (a) => {
  const b = [...a];
  for (let i = b.length - 1; i > 0; i--) {
    const j = R(0, i);
    [b[i], b[j]] = [b[j], b[i]];
  }
  return b;
};

// ── Sequence generators for Number Series ──
export const seqGens = [
  // 1. Simple addition (+d)
  () => {
    const d = R(2, 8), s = R(1, 20), q = [];
    for (let i = 0; i < 6; i++) q.push(s + d * i);
    return {
      seq: q, rule: `+${d} per step`,
      ex: () => {
        const df = [];
        for (let i = 1; i < q.length; i++) df.push(q[i] - q[i - 1]);
        return { steps: [`Differences: ${df.map(x => `<span class="hl">+${x}</span>`).join(', ')}`, `Each number +${d}`], f: `a(n) = ${s} + ${d}n` };
      }
    };
  },
  // 2. Simple subtraction (−d)
  () => {
    const d = R(2, 6), s = R(30, 60), q = [];
    for (let i = 0; i < 6; i++) q.push(s - d * i);
    return { seq: q, rule: `−${d}`, ex: () => ({ steps: [`Each number −${d}`], f: `a(n) = ${s} − ${d}n` }) };
  },
  // 3. Multiply (×m)
  () => {
    const m = R(2, 4), s = R(1, 5), q = [];
    let v = s;
    for (let i = 0; i < 6; i++) { q.push(v); v *= m; }
    return {
      seq: q, rule: `×${m}`,
      ex: () => ({ steps: q.slice(1).map((val, i) => `${q[i]} × ${m} = <span class="hl">${val}</span>`), f: `a(n) = ${s} × ${m}ⁿ` })
    };
  },
  // 4. Perfect squares
  () => {
    const o = R(1, 5), q = [];
    for (let i = 0; i < 6; i++) q.push((i + o) ** 2);
    return {
      seq: q, rule: 'Perfect squares',
      ex: () => ({ steps: q.map((val, i) => `${i + o}² = <span class="hl">${val}</span>`), f: 'a(n) = n²' })
    };
  },
  // 5. Fibonacci-style
  () => {
    let a = R(1, 5), b = R(1, 5);
    const q = [a, b];
    for (let i = 2; i < 6; i++) { const c = a + b; q.push(c); a = b; b = c; }
    return {
      seq: q, rule: 'Fibonacci',
      ex: () => ({ steps: [`Start: ${q[0]}, ${q[1]}`, ...q.slice(2).map((val, i) => `${q[i]}+${q[i + 1]}=<span class="hl">${val}</span>`)], f: 'a(n) = a(n-1) + a(n-2)' })
    };
  },
  // 6. Increasing differences
  () => {
    const s = R(1, 10), b = R(1, 3), q = [s];
    for (let i = 1; i < 6; i++) q.push(q[i - 1] + b + i);
    return {
      seq: q, rule: 'Increasing diff.',
      ex: () => {
        const df = [];
        for (let i = 1; i < q.length; i++) df.push(q[i] - q[i - 1]);
        return { steps: [`Diff: ${df.map(x => `<span class="hl">${x}</span>`).join(', ')}`], f: `+${b + 1}, +${b + 2}, +${b + 3}...` };
      }
    };
  },
  // 7. Primes
  () => {
    const P = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37];
    const s = R(0, 6);
    return {
      seq: P.slice(s, s + 6), rule: 'Primes',
      ex: () => ({ steps: P.slice(s, s + 6).map(v => `<span class="hl">${v}</span> = prime`), f: 'Prime sequence' })
    };
  },
  // 8. ×2 + c
  () => {
    const c = R(1, 3), s = R(1, 4), q = [s];
    for (let i = 1; i < 6; i++) q.push(q[i - 1] * 2 + c);
    return {
      seq: q, rule: `×2+${c}`,
      ex: () => ({ steps: q.slice(1).map((val, i) => `${q[i]}×2+${c} = <span class="hl">${val}</span>`), f: `a(n) = a(n-1)×2+${c}` })
    };
  },
  // 9. Alternating +a / −b
  () => {
    const a = R(3, 8), b = R(1, a - 1), s = R(5, 20), q = [s];
    for (let i = 1; i < 6; i++) q.push(q[i - 1] + (i % 2 === 1 ? a : -b));
    return {
      seq: q, rule: `+${a}, −${b} alternating`,
      ex: () => {
        const df = [];
        for (let i = 1; i < q.length; i++) df.push(q[i] - q[i - 1]);
        return { steps: [`Pattern: ${df.map(x => `<span class="hl">${x > 0 ? '+' : ''}${x}</span>`).join(', ')}`, `Alternating +${a} then −${b}`], f: `+${a}, −${b}, +${a}, −${b}...` };
      }
    };
  },
  // 10. Alternating ×m / ÷d (stay integer)
  () => {
    const m = R(2, 3), d = pick([2, 3]);
    let s = d * R(2, 5);
    const q = [s];
    for (let i = 1; i < 6; i++) {
      if (i % 2 === 1) q.push(q[i - 1] * m);
      else q.push(q[i - 1] / d);
    }
    // verify integer
    if (q.some(v => !Number.isInteger(v) || v > 5000)) return seqGens[0]();
    return {
      seq: q, rule: `×${m}, ÷${d} alternating`,
      ex: () => {
        const steps = q.slice(1).map((val, i) => {
          const op = i % 2 === 0 ? `×${m}` : `÷${d}`;
          return `${q[i]} ${op} = <span class="hl">${val}</span>`;
        });
        return { steps, f: `×${m}, ÷${d}, ×${m}, ÷${d}...` };
      }
    };
  },
  // 11. Cubes
  () => {
    const o = R(1, 4), q = [];
    for (let i = 0; i < 6; i++) q.push((i + o) ** 3);
    return {
      seq: q, rule: 'Perfect cubes',
      ex: () => ({ steps: q.map((val, i) => `${i + o}³ = <span class="hl">${val}</span>`), f: 'a(n) = n³' })
    };
  },
  // 12. Triangular numbers
  () => {
    const o = R(1, 4), q = [];
    for (let i = 0; i < 6; i++) { const n = i + o; q.push(n * (n + 1) / 2); }
    return {
      seq: q, rule: 'Triangular numbers',
      ex: () => ({ steps: q.map((val, i) => `T(${i + o}) = ${i + o}×${i + o + 1}/2 = <span class="hl">${val}</span>`), f: 'T(n) = n(n+1)/2' })
    };
  },
  // 13. Interleaved: two separate +d sequences mixed
  () => {
    const d1 = R(2, 5), d2 = R(2, 5), s1 = R(1, 10), s2 = R(15, 30), q = [];
    for (let i = 0; i < 6; i++) {
      if (i % 2 === 0) q.push(s1 + d1 * (i / 2));
      else q.push(s2 + d2 * ((i - 1) / 2));
    }
    return {
      seq: q, rule: `Two interleaved series (+${d1} and +${d2})`,
      ex: () => ({
        steps: [
          `Odd positions: ${q.filter((_, i) => i % 2 === 0).map(v => `<span class="hl">${v}</span>`).join(', ')} (+${d1})`,
          `Even positions: ${q.filter((_, i) => i % 2 === 1).map(v => `<span class="hl">${v}</span>`).join(', ')} (+${d2})`,
        ],
        f: `Two sequences: ${s1}+${d1}n and ${s2}+${d2}n`
      })
    };
  },
  // 14. Decreasing differences
  () => {
    const s = R(1, 10), base = R(6, 10), q = [s];
    for (let i = 1; i < 6; i++) q.push(q[i - 1] + Math.max(1, base - i));
    return {
      seq: q, rule: 'Decreasing differences',
      ex: () => {
        const df = [];
        for (let i = 1; i < q.length; i++) df.push(q[i] - q[i - 1]);
        return { steps: [`Diff: ${df.map(x => `<span class="hl">+${x}</span>`).join(', ')}`, 'Differences decrease by 1'], f: `+${base - 1}, +${base - 2}, +${base - 3}...` };
      }
    };
  },
  // 15. ×m − c
  () => {
    const m = R(2, 3), c = R(1, 4), s = R(2, 5), q = [s];
    for (let i = 1; i < 6; i++) q.push(q[i - 1] * m - c);
    if (q.some(v => v > 3000 || v < 0)) return seqGens[0]();
    return {
      seq: q, rule: `×${m}−${c}`,
      ex: () => ({ steps: q.slice(1).map((val, i) => `${q[i]}×${m}−${c} = <span class="hl">${val}</span>`), f: `a(n) = a(n-1)×${m}−${c}` })
    };
  },
  // 16. Add previous difference + constant (second order)
  () => {
    const s = R(1, 5), d0 = R(1, 4), inc = R(1, 3), q = [s, s + d0];
    let diff = d0;
    for (let i = 2; i < 6; i++) { diff += inc; q.push(q[i - 1] + diff); }
    return {
      seq: q, rule: `Diff increases by ${inc}`,
      ex: () => {
        const df = [], dd = [];
        for (let i = 1; i < q.length; i++) df.push(q[i] - q[i - 1]);
        for (let i = 1; i < df.length; i++) dd.push(df[i] - df[i - 1]);
        return {
          steps: [
            `1st diff: ${df.map(x => `<span class="hl">+${x}</span>`).join(', ')}`,
            `2nd diff: ${dd.map(x => `<span class="hl">+${x}</span>`).join(', ')} (constant ${inc})`,
          ],
          f: `Differences: +${d0}, +${d0 + inc}, +${d0 + 2 * inc}...`
        };
      }
    };
  },
  // 17. Alternating +a, +b (two different adds)
  () => {
    const a = R(2, 6), b = R(2, 6);
    if (a === b) return seqGens[0]();
    const s = R(1, 15), q = [s];
    for (let i = 1; i < 6; i++) q.push(q[i - 1] + (i % 2 === 1 ? a : b));
    return {
      seq: q, rule: `+${a}, +${b} alternating`,
      ex: () => {
        const df = [];
        for (let i = 1; i < q.length; i++) df.push(q[i] - q[i - 1]);
        return { steps: [`Differences: ${df.map(x => `<span class="hl">+${x}</span>`).join(', ')}`, `Alternating +${a} and +${b}`], f: `+${a}, +${b}, +${a}, +${b}...` };
      }
    };
  },
  // 18. Powers of n
  () => {
    const base = R(2, 4), q = [];
    for (let i = 0; i < 6; i++) q.push(base ** i);
    return {
      seq: q, rule: `Powers of ${base}`,
      ex: () => ({ steps: q.map((val, i) => `${base}^${i} = <span class="hl">${val}</span>`), f: `a(n) = ${base}ⁿ` })
    };
  },
  // 19. n² + n (oblong numbers)
  () => {
    const o = R(1, 3), q = [];
    for (let i = 0; i < 6; i++) { const n = i + o; q.push(n * n + n); }
    return {
      seq: q, rule: 'n² + n',
      ex: () => ({ steps: q.map((val, i) => `${i + o}² + ${i + o} = <span class="hl">${val}</span>`), f: 'a(n) = n² + n' })
    };
  },
  // 20. Multiply by increasing factor (×2, ×3, ×4...)
  () => {
    const s = R(1, 3), q = [s];
    for (let i = 1; i < 6; i++) q.push(q[i - 1] * (i + 1));
    if (q[5] > 5000) return seqGens[0]();
    return {
      seq: q, rule: '×2, ×3, ×4...',
      ex: () => ({
        steps: q.slice(1).map((val, i) => `${q[i]} × ${i + 2} = <span class="hl">${val}</span>`),
        f: 'a(n) = a(n-1) × n'
      })
    };
  },
  // 21. +d, ×m alternating
  () => {
    const d = R(2, 5), m = R(2, 3), s = R(1, 6), q = [s];
    for (let i = 1; i < 6; i++) {
      q.push(i % 2 === 1 ? q[i - 1] + d : q[i - 1] * m);
    }
    if (q.some(v => v > 3000)) return seqGens[0]();
    return {
      seq: q, rule: `+${d}, ×${m} alternating`,
      ex: () => {
        const steps = q.slice(1).map((val, i) => {
          const op = i % 2 === 0 ? `+${d}` : `×${m}`;
          return `${q[i]} ${op} = <span class="hl">${val}</span>`;
        });
        return { steps, f: `+${d}, ×${m}, +${d}, ×${m}...` };
      }
    };
  },
  // 22. Difference of squares: n² − (n−1)² = 2n−1
  () => {
    const o = R(2, 6), q = [];
    for (let i = 0; i < 6; i++) q.push(2 * (i + o) - 1);
    return {
      seq: q, rule: 'Odd numbers',
      ex: () => ({
        steps: q.map((val, i) => `2×${i + o} − 1 = <span class="hl">${val}</span>`),
        f: 'a(n) = 2n − 1 (consecutive odds)'
      })
    };
  },
  // 23. Sum of all previous terms
  () => {
    const s = R(1, 3), q = [s, s];
    for (let i = 2; i < 6; i++) {
      let sum = 0;
      for (let j = 0; j < i; j++) sum += q[j];
      q.push(sum);
    }
    return {
      seq: q, rule: 'Sum of previous',
      ex: () => ({
        steps: q.slice(2).map((val, i) => `${q.slice(0, i + 2).join('+')} = <span class="hl">${val}</span>`),
        f: 'a(n) = sum of all previous terms'
      })
    };
  },
  // 24. Double then subtract pattern: ×2, −c repeating
  () => {
    const c = R(1, 5), s = R(3, 8), q = [s];
    for (let i = 1; i < 6; i++) {
      q.push(i % 2 === 1 ? q[i - 1] * 2 : q[i - 1] - c);
    }
    if (q.some(v => v > 3000 || v < 0)) return seqGens[0]();
    return {
      seq: q, rule: `×2, −${c} alternating`,
      ex: () => {
        const steps = q.slice(1).map((val, i) => {
          const op = i % 2 === 0 ? '×2' : `−${c}`;
          return `${q[i]} ${op} = <span class="hl">${val}</span>`;
        });
        return { steps, f: `×2, −${c}, ×2, −${c}...` };
      }
    };
  },
  // 25. Divide then add: ÷2, +c alternating
  () => {
    const c = R(2, 6);
    let s = R(4, 8) * 8;
    const q = [s];
    for (let i = 1; i < 6; i++) {
      q.push(i % 2 === 1 ? q[i - 1] / 2 : q[i - 1] + c);
    }
    if (q.some(v => !Number.isInteger(v) || v < 0 || v > 5000)) return seqGens[0]();
    return {
      seq: q, rule: `÷2, +${c} alternating`,
      ex: () => {
        const steps = q.slice(1).map((val, i) => {
          const op = i % 2 === 0 ? '÷2' : `+${c}`;
          return `${q[i]} ${op} = <span class="hl">${val}</span>`;
        });
        return { steps, f: `÷2, +${c}, ÷2, +${c}...` };
      }
    };
  },
  // 26. +d then ×2 compound: a(n) = (a(n-1) + d) × 2
  () => {
    const d = R(1, 3), s = R(1, 4), q = [s];
    for (let i = 1; i < 6; i++) q.push((q[i - 1] + d) * 2);
    if (q.some(v => v > 5000)) return seqGens[0]();
    return {
      seq: q, rule: `(+${d}) × 2`,
      ex: () => ({
        steps: q.slice(1).map((val, i) => `(${q[i]} + ${d}) × 2 = <span class="hl">${val}</span>`),
        f: `a(n) = (a(n-1) + ${d}) × 2`
      })
    };
  },
  // 27. √x × 2 pattern: perfect squares scaled
  () => {
    const m = R(2, 4), o = R(1, 3), q = [];
    for (let i = 0; i < 6; i++) { const n = i + o; q.push(Math.round(Math.sqrt(n * n) * m)); }
    // Use actual squares: n² × m
    const q2 = [];
    for (let i = 0; i < 6; i++) { const n = i + o; q2.push(n * n * m); }
    return {
      seq: q2, rule: `n² × ${m}`,
      ex: () => ({
        steps: q2.map((val, i) => `${i + o}² × ${m} = <span class="hl">${val}</span>`),
        f: `a(n) = n² × ${m}`
      })
    };
  },
  // 28. +3, ×2 alternating (complex combo)
  () => {
    const add = R(2, 5), mul = R(2, 3), s = R(1, 5), q = [s];
    for (let i = 1; i < 6; i++) {
      q.push(i % 2 === 1 ? q[i - 1] + add : q[i - 1] * mul);
    }
    if (q.some(v => v > 5000 || v < 0)) return seqGens[0]();
    return {
      seq: q, rule: `+${add}, ×${mul} alternating`,
      ex: () => ({
        steps: q.slice(1).map((val, i) => {
          const op = i % 2 === 0 ? `+${add}` : `×${mul}`;
          return `${q[i]} ${op} = <span class="hl">${val}</span>`;
        }),
        f: `+${add}, ×${mul}, +${add}, ×${mul}...`
      })
    };
  },
  // 29. n³ − n (difference of cube and linear)
  () => {
    const o = R(1, 3), q = [];
    for (let i = 0; i < 6; i++) { const n = i + o; q.push(n * n * n - n); }
    return {
      seq: q, rule: 'n³ − n',
      ex: () => ({
        steps: q.map((val, i) => `${i + o}³ − ${i + o} = <span class="hl">${val}</span>`),
        f: 'a(n) = n³ − n = n(n−1)(n+1)'
      })
    };
  },
  // 30. Double differences: diff of diff is constant (quadratic)
  () => {
    const a = R(1, 3), b = R(2, 5), c = R(1, 3), q = [];
    for (let i = 0; i < 6; i++) q.push(a * i * i + b * i + c);
    return {
      seq: q, rule: `Quadratic: ${a}n² + ${b}n + ${c}`,
      ex: () => {
        const df = [], dd = [];
        for (let i = 1; i < q.length; i++) df.push(q[i] - q[i - 1]);
        for (let i = 1; i < df.length; i++) dd.push(df[i] - df[i - 1]);
        return {
          steps: [
            `1st diff: ${df.map(x => `<span class="hl">${x}</span>`).join(', ')}`,
            `2nd diff: ${dd.map(x => `<span class="hl">${x}</span>`).join(', ')} (constant = ${2 * a})`,
          ],
          f: `a(n) = ${a}n² + ${b}n + ${c}`
        };
      }
    };
  },
  // 31. Factorial-based: n!
  () => {
    const o = R(1, 2), q = [];
    let f = 1;
    for (let i = 0; i < o; i++) f *= (i + 1);
    for (let i = 0; i < 6; i++) { const n = i + o; f = i === 0 ? f : f * n; if (i === 0) { f = 1; for (let j = 1; j <= n; j++) f *= j; } q.push(f); }
    // Simpler: just compute factorials
    const q2 = [];
    for (let i = 0; i < 6; i++) {
      const n = i + o;
      let fac = 1;
      for (let j = 2; j <= n; j++) fac *= j;
      q2.push(fac);
    }
    if (q2.some(v => v > 10000)) return seqGens[0]();
    return {
      seq: q2, rule: 'Factorials',
      ex: () => ({
        steps: q2.map((val, i) => `${i + o}! = <span class="hl">${val}</span>`),
        f: 'a(n) = n!'
      })
    };
  },
  // 32. ×m, +c, ×m, +c with different c each time (increasing c)
  () => {
    const m = R(2, 3), s = R(1, 4), q = [s];
    for (let i = 1; i < 6; i++) {
      q.push(i % 2 === 1 ? q[i - 1] * m : q[i - 1] + i);
    }
    if (q.some(v => v > 5000)) return seqGens[0]();
    return {
      seq: q, rule: `×${m}, +increasing`,
      ex: () => ({
        steps: q.slice(1).map((val, i) => {
          const op = i % 2 === 0 ? `×${m}` : `+${i + 1}`;
          return `${q[i]} ${op} = <span class="hl">${val}</span>`;
        }),
        f: `×${m}, +1, ×${m}, +2, ×${m}, +3...`
      })
    };
  },
  // 33. Three-step repeating pattern: +a, ×b, −c
  () => {
    const a = R(2, 6), b = R(2, 3), c = R(1, 4), s = R(2, 8), q = [s];
    for (let i = 1; i < 6; i++) {
      const phase = i % 3;
      if (phase === 1) q.push(q[i - 1] + a);
      else if (phase === 2) q.push(q[i - 1] * b);
      else q.push(q[i - 1] - c);
    }
    if (q.some(v => v > 5000 || v < 0)) return seqGens[0]();
    return {
      seq: q, rule: `+${a}, ×${b}, −${c} repeating`,
      ex: () => ({
        steps: q.slice(1).map((val, i) => {
          const ops = [`+${a}`, `×${b}`, `−${c}`];
          return `${q[i]} ${ops[i % 3]} = <span class="hl">${val}</span>`;
        }),
        f: `+${a}, ×${b}, −${c}, +${a}, ×${b}, −${c}...`
      })
    };
  },
  // 34. Square root chain: each term is prev + √prev (rounded)
  () => {
    const starts = [4, 9, 16, 25, 36, 49, 64];
    const s = pick(starts);
    const q = [s];
    for (let i = 1; i < 6; i++) {
      const sr = Math.round(Math.sqrt(q[i - 1]));
      q.push(q[i - 1] + sr);
    }
    if (q.some(v => v > 5000)) return seqGens[0]();
    return {
      seq: q, rule: 'n + √n chain',
      ex: () => ({
        steps: q.slice(1).map((val, i) => `${q[i]} + √${q[i]} ≈ ${q[i]} + ${Math.round(Math.sqrt(q[i]))} = <span class="hl">${val}</span>`),
        f: 'a(n) = a(n-1) + √a(n-1)'
      })
    };
  },
,
  // 35. Interleaved Fibonacci-style: two separate Fibonacci sequences merged
  () => {
    let a1 = R(1, 3), b1 = R(1, 3), a2 = R(10, 15), b2 = R(1, 3);
    const s1 = [a1, b1], s2 = [a2, b2];
    for (let i = 2; i < 4; i++) { const c = s1[i-2]+s1[i-1]; s1.push(c); const d = s2[i-2]+s2[i-1]; s2.push(d); }
    const q = [s1[0], s2[0], s1[1], s2[1], s1[2], s2[2]];
    if (q.some(v => v > 5000)) return seqGens[4]();
    return {
      seq: q, rule: 'Two interleaved Fibonacci series',
      ex: () => ({
        steps: [
          `Odd positions: ${[q[0],q[2],q[4]].map(v=>`<span class="hl">${v}</span>`).join(', ')} (Fib from ${a1},${b1})`,
          `Even positions: ${[q[1],q[3],q[5]].map(v=>`<span class="hl">${v}</span>`).join(', ')} (Fib from ${a2},${b2})`,
        ],
        f: 'Two interleaved Fibonacci sequences'
      })
    };
  },
  // 36. 2^n + n (exponential + linear)
  () => {
    const o = R(0, 2), q = [];
    for (let i = 0; i < 6; i++) { const n = i + o; q.push(Math.pow(2, n) + n); }
    if (q.some(v => v > 8000)) return seqGens[0]();
    return {
      seq: q, rule: '2ⁿ + n',
      ex: () => ({
        steps: q.map((val, i) => `2^${i+o} + ${i+o} = ${Math.pow(2,i+o)} + ${i+o} = <span class="hl">${val}</span>`),
        f: 'a(n) = 2ⁿ + n'
      })
    };
  },
  // 37. a(n) = n² - n + 1 (prime-counting-like quadratic)
  () => {
    const o = R(1, 3), q = [];
    for (let i = 0; i < 6; i++) { const n = i + o; q.push(n*n - n + 1); }
    return {
      seq: q, rule: 'n² − n + 1',
      ex: () => ({
        steps: q.map((val, i) => `${i+o}² − ${i+o} + 1 = <span class="hl">${val}</span>`),
        f: 'a(n) = n² − n + 1'
      })
    };
  },
  // 38. Triple-step cycle with different operations each step
  () => {
    const a = R(2, 4), b = R(2, 3), c = R(3, 7), s = R(1, 4), q = [s];
    for (let i = 1; i < 6; i++) {
      const p = i % 3;
      if (p === 1) q.push(q[i-1] * a);
      else if (p === 2) q.push(q[i-1] + c);
      else q.push(Math.floor(q[i-1] / b));
    }
    if (q.some(v => v > 5000 || v < 0 || !Number.isInteger(v))) return seqGens[0]();
    return {
      seq: q, rule: `×${a}, +${c}, ÷${b} cycle`,
      ex: () => ({
        steps: q.slice(1).map((val, i) => {
          const ops = [`×${a}`, `+${c}`, `÷${b}`];
          return `${q[i]} ${ops[i % 3]} = <span class="hl">${val}</span>`;
        }),
        f: `×${a}, +${c}, ÷${b}, ×${a}, +${c}, ÷${b}...`
      })
    };
  },
  // 39. Geometric mean-like: a(n) = a(n-1) × a(n-2) (product of previous two)
  () => {
    let a = R(1, 2), b = R(2, 3), q = [a, b];
    for (let i = 2; i < 6; i++) q.push(q[i-2] * q[i-1]);
    if (q.some(v => v > 9000)) return seqGens[3]();
    return {
      seq: q, rule: 'Product of prev two',
      ex: () => ({
        steps: q.slice(2).map((val, i) => `${q[i]} × ${q[i+1]} = <span class="hl">${val}</span>`),
        f: 'a(n) = a(n-1) × a(n-2)'
      })
    };
  },
  // 40. n! / (n-1)! = n trick (factorial ratios) — shown as cumulative products
  () => {
    const o = R(2, 4), q = [];
    let prod = 1;
    for (let i = 0; i < 6; i++) { prod *= (i + o); q.push(prod); }
    if (q.some(v => v > 10000)) return seqGens[0]();
    return {
      seq: q, rule: `Cumulative product from ${o}`,
      ex: () => ({
        steps: q.map((val, i) => {
          const factors = Array.from({length: i+1}, (_,j) => j+o).join(' × ');
          return `${factors} = <span class="hl">${val}</span>`;
        }),
        f: `a(n) = ${o} × ${o+1} × ... × (${o}+n)`
      })
    };
  },
  // 41. +a, ×b, ÷c three-step cycle (guaranteed integers)
  () => {
    for (let tries = 0; tries < 200; tries++) {
      const a = R(2, 6), b = R(2, 4), c = pick([2, 3, 4]);
      const s = c * R(2, 6);
      const q = [s];
      let ok = true;
      for (let i = 1; i < 7; i++) {
        const p = i % 3;
        let v = p === 1 ? q[i-1] + a : p === 2 ? q[i-1] * b : q[i-1] / c;
        if (!Number.isInteger(v) || v <= 0 || v > 8000) { ok = false; break; }
        q.push(v);
      }
      if (ok && q.length === 7) {
        const seq = q.slice(0, 6);
        return {
          seq, rule: `+${a}, ×${b}, ÷${c} cycle`,
          ex: () => ({
            steps: seq.slice(1).map((val, i) => {
              const ops = [`+${a}`, `×${b}`, `÷${c}`];
              return `${seq[i]} ${ops[i % 3]} = <span class="hl">${val}</span>`;
            }),
            f: `+${a}, ×${b}, ÷${c}, +${a}, ×${b}, ÷${c}...`
          })
        };
      }
    }
    return seqGens[32]();
  },
  // 42. ×a, +b, ÷c, −d four-step cycle
  () => {
    for (let tries = 0; tries < 200; tries++) {
      const a = R(2, 3), b = R(3, 8), c = pick([2, 3]), d = R(1, 4);
      const s = c * R(3, 8);
      const q = [s];
      let ok = true;
      for (let i = 1; i < 7; i++) {
        const p = i % 4;
        let v = p === 1 ? q[i-1] * a : p === 2 ? q[i-1] + b : p === 3 ? q[i-1] / c : q[i-1] - d;
        if (!Number.isInteger(v) || v <= 0 || v > 8000) { ok = false; break; }
        q.push(v);
      }
      if (ok && q.length === 7) {
        const seq = q.slice(0, 6);
        return {
          seq, rule: `×${a}, +${b}, ÷${c}, −${d} cycle`,
          ex: () => ({
            steps: seq.slice(1).map((val, i) => {
              const ops = [`×${a}`, `+${b}`, `÷${c}`, `−${d}`];
              return `${seq[i]} ${ops[i % 4]} = <span class="hl">${val}</span>`;
            }),
            f: `×${a}, +${b}, ÷${c}, −${d}, repeating`
          })
        };
      }
    }
    return seqGens[37]();
  },
  // 43. ×2, ÷3, ×4, ÷5, ×6 — alternating multiply/divide by increasing n
  () => {
    // ops: ×2, ÷3, ×4, ÷5, ×6 → divisors at positions 1,3 are 3,5 → start = LCM(3,5)×k
    const k = R(1, 4);
    const s = 15 * k;
    if (s > 8000) return seqGens[9]();
    const q = [s];
    for (let i = 0; i < 5; i++) {
      const factor = i + 2;
      q.push(i % 2 === 0 ? q[i] * factor : q[i] / factor);
    }
    if (q.some(v => !Number.isInteger(v) || v <= 0 || v > 8000)) return seqGens[9]();
    return {
      seq: q.slice(0, 6), rule: '×2, ÷3, ×4, ÷5, ×6...',
      ex: () => ({
        steps: q.slice(1, 6).map((val, i) => {
          const factor = i + 2;
          const op = i % 2 === 0 ? `×${factor}` : `÷${factor}`;
          return `${q[i]} ${op} = <span class="hl">${val}</span>`;
        }),
        f: 'Multiply/divide by increasing n: ×2, ÷3, ×4, ÷5...'
      })
    };
  },
  // 44. ÷2, ÷3, ÷4, ÷5, ÷6 — divide by increasing n (start from 720)
  () => {
    const scale = pick([1, 2]);
    const s = 720 * scale;
    if (s > 8000) return seqGens[10]();
    const q = [s];
    for (let d = 2; d <= 6; d++) q.push(q[q.length - 1] / d);
    return {
      seq: q.slice(0, 6), rule: '÷2, ÷3, ÷4, ÷5, ÷6',
      ex: () => ({
        steps: q.slice(1, 6).map((val, i) => `${q[i]} ÷ ${i + 2} = <span class="hl">${val}</span>`),
        f: 'Divide by 2, then 3, then 4, then 5...'
      })
    };
  },
  // 45. +1, ×2, +2, ×3, +3 — alternating add/multiply with increasing operands
  () => {
    const s = R(1, 4);
    const q = [s];
    for (let i = 1; i < 6; i++) {
      const n = Math.ceil(i / 2);
      q.push(i % 2 === 1 ? q[i - 1] + n : q[i - 1] * (n + 1));
    }
    if (q.some(v => v > 8000)) return seqGens[20]();
    return {
      seq: q, rule: '+1, ×2, +2, ×3, +3... (increasing)',
      ex: () => ({
        steps: q.slice(1).map((val, i) => {
          const n = Math.ceil((i + 1) / 2);
          const op = i % 2 === 0 ? `+${n}` : `×${n + 1}`;
          return `${q[i]} ${op} = <span class="hl">${val}</span>`;
        }),
        f: '+1, ×2, +2, ×3, +3, ×4... (operands increase each step)'
      })
    };
  },
  // 46. +a, ×m, ÷n cycle where the add increases by 1 each full cycle
  () => {
    for (let tries = 0; tries < 200; tries++) {
      const m = pick([3, 4, 6]), n = pick([2, 3]), a0 = R(2, 5);
      if (m % n !== 0) continue; // ensure ×m then ÷n is clean only when needed
      const s = n * R(2, 6);
      const q = [s];
      let ok = true;
      for (let i = 0; i < 5; i++) {
        const cycle = Math.floor(i / 3);
        const step = i % 3;
        const add = a0 + cycle;
        const v = step === 0 ? q[i] + add : step === 1 ? q[i] * m : q[i] / n;
        if (!Number.isInteger(v) || v <= 0 || v > 8000) { ok = false; break; }
        q.push(v);
      }
      if (ok && q.length === 6) {
        return {
          seq: q, rule: `+${a0},×${m},÷${n} → +${a0 + 1},×${m},÷${n}...`,
          ex: () => ({
            steps: q.slice(1).map((val, i) => {
              const cycle = Math.floor(i / 3);
              const step = i % 3;
              const add = a0 + cycle;
              const ops = [`+${add}`, `×${m}`, `÷${n}`];
              return `${q[i]} ${ops[step]} = <span class="hl">${val}</span>`;
            }),
            f: `+${a0},×${m},÷${n}, +${a0 + 1},×${m},÷${n} (add grows each cycle)`
          })
        };
      }
    }
    return seqGens[41]();
  },
  // 47. +a₁, ×b₁, +a₂, ×b₂, +a₃ — both adds and multiplies change each pair
  () => {
    for (let tries = 0; tries < 200; tries++) {
      const a1 = R(2, 5), b1 = R(2, 3), a2 = R(2, 5), b2 = R(2, 3);
      if (a1 === a2 && b1 === b2) continue;
      const s = R(1, 5);
      const q = [s, s + a1, (s + a1) * b1, (s + a1) * b1 + a2, ((s + a1) * b1 + a2) * b2];
      q.push(q[4] + a1 + 1); // next add grows
      if (q.some(v => !Number.isInteger(v) || v <= 0 || v > 8000)) continue;
      return {
        seq: q, rule: `+${a1},×${b1},+${a2},×${b2} alternating`,
        ex: () => ({
          steps: q.slice(1).map((val, i) => {
            const ops = [`+${a1}`, `×${b1}`, `+${a2}`, `×${b2}`, `+${a1 + 1}`];
            return `${q[i]} ${ops[i]} = <span class="hl">${val}</span>`;
          }),
          f: `+${a1}, ×${b1}, +${a2}, ×${b2}, +${a1 + 1}...`
        })
      };
    }
    return seqGens[27]();
  },
];

// ── Difficulty-filtered sequence generators ──
// Returns a subset of seqGens appropriate for the given difficulty level.
// Higher difficulty = EXCLUDES trivial patterns and uses ONLY complex ones.
//
// Trivial indices (never appear in hard/really-hard):
//   0=+d, 1=−d, 5=incr.diff, 6=primes, 21=odds(+2)
//
// Index tiers:
//   Easy    (0–8):   basic arithmetic, squares, fibonacci
//   Medium  (0–19):  + alternating, cubes, triangular, interleaved
//   Hard    (9–31):  only non-trivial — no simple +d/−d/odds
//   R-Hard  (20–43): only complex multi-step, compound, exponential (excl. 21)
export function getSeqGens(difficulty = 'medium') {
  const TRIVIAL = new Set([0, 1, 5, 6, 21]); // +d, −d, incr.diff, primes, odds
  switch (difficulty) {
    case 'easy':
      return seqGens.slice(0, 9);
    case 'medium':
      return seqGens.slice(0, 20);
    case 'hard':
      // Non-trivial generators from medium range upward, capped before 3-step cycles
      return seqGens.filter((_, i) => i >= 7 && i < 33 && !TRIVIAL.has(i));
    case 'really-hard':
      // Only complex: starts at +d/×m alternating (20), skips trivial odds (21)
      // includes all new 3/4-step cycle generators (41–43)
      return seqGens.filter((_, i) => i >= 20 && !TRIVIAL.has(i));
    case 'extreme':
      return seqGens.filter((_, i) => i >= 28 && !TRIVIAL.has(i));
    case 'grandmaster':
      return seqGens.filter((_, i) => i >= 32);
    default:
      return seqGens.slice(0, 20);
  }
}

// ── Series-type metadata ──
// Maps each generator to a type matching the seriesType selector in Training.jsx.
// Types: 'mixed' | 'fibonacci' | 'exponential' | 'primes' | 'alternating' | 'sqrt-exp'
const seqGensMeta = [
  { fn: seqGens[0],  type: 'mixed' },        // 0.  +d
  { fn: seqGens[1],  type: 'mixed' },        // 1.  −d
  { fn: seqGens[2],  type: 'exponential' },  // 2.  ×m
  { fn: seqGens[3],  type: 'sqrt-exp' },     // 3.  Perfect squares
  { fn: seqGens[4],  type: 'fibonacci' },    // 4.  Fibonacci-style
  { fn: seqGens[5],  type: 'mixed' },        // 5.  Increasing differences
  { fn: seqGens[6],  type: 'primes' },       // 6.  Primes
  { fn: seqGens[7],  type: 'mixed' },        // 7.  ×2+c
  { fn: seqGens[8],  type: 'alternating' },  // 8.  Alternating +a / −b
  { fn: seqGens[9],  type: 'alternating' },  // 9.  Alternating ×m / ÷d
  { fn: seqGens[10], type: 'sqrt-exp' },     // 10. Cubes
  { fn: seqGens[11], type: 'mixed' },        // 11. Triangular numbers
  { fn: seqGens[12], type: 'alternating' },  // 12. Interleaved two +d series
  { fn: seqGens[13], type: 'mixed' },        // 13. Decreasing differences
  { fn: seqGens[14], type: 'mixed' },        // 14. ×m − c
  { fn: seqGens[15], type: 'mixed' },        // 15. Second-order diff (diff increases)
  { fn: seqGens[16], type: 'alternating' },  // 16. Alternating +a, +b
  { fn: seqGens[17], type: 'exponential' },  // 17. Powers of n
  { fn: seqGens[18], type: 'sqrt-exp' },     // 18. n² + n
  { fn: seqGens[19], type: 'alternating' },  // 19. ×2, ×3, ×4... (growing factor)
  { fn: seqGens[20], type: 'alternating' },  // 20. +d, ×m alternating
  { fn: seqGens[21], type: 'mixed' },        // 21. Odd numbers (2n−1)
  { fn: seqGens[22], type: 'fibonacci' },    // 22. Sum of all previous
  { fn: seqGens[23], type: 'alternating' },  // 23. ×2, −c alternating
  { fn: seqGens[24], type: 'alternating' },  // 24. ÷2, +c alternating
  { fn: seqGens[25], type: 'mixed' },        // 25. (+d) × 2 compound
  { fn: seqGens[26], type: 'sqrt-exp' },     // 26. n² × m
  { fn: seqGens[27], type: 'alternating' },  // 27. +add, ×mul alternating
  { fn: seqGens[28], type: 'sqrt-exp' },     // 28. n³ − n
  { fn: seqGens[29], type: 'mixed' },        // 29. Quadratic: an² + bn + c
  { fn: seqGens[30], type: 'mixed' },        // 30. Factorials
  { fn: seqGens[31], type: 'alternating' },  // 31. ×m, +increasing
  { fn: seqGens[32], type: 'mixed' },        // 32. +a, ×b, −c three-step
  { fn: seqGens[33], type: 'sqrt-exp' },     // 33. n + √n chain
  { fn: seqGens[34], type: 'fibonacci' },    // 34. Interleaved Fibonacci
  { fn: seqGens[35], type: 'exponential' },  // 35. 2ⁿ + n
  { fn: seqGens[36], type: 'sqrt-exp' },     // 36. n² − n + 1
  { fn: seqGens[37], type: 'alternating' },  // 37. ×a, +c, ÷b cycle
  { fn: seqGens[38], type: 'fibonacci' },    // 38. Product of prev two (geometric-mean-like)
  { fn: seqGens[39], type: 'mixed' },        // 39. Cumulative product
  { fn: seqGens[40], type: 'alternating' },  // 40. +a, ×b, ÷c three-step cycle
  { fn: seqGens[41], type: 'alternating' },  // 41. ×a, +b, ÷c, −d four-step cycle
  { fn: seqGens[42], type: 'alternating' },  // 42. ×2,÷3,×4,÷5,×6 increasing factors
  { fn: seqGens[43], type: 'mixed' },        // 43. ÷2,÷3,÷4,÷5,÷6 from 720
  { fn: seqGens[44], type: 'alternating' },  // 44. +1,×2,+2,×3,+3 increasing operands
  { fn: seqGens[45], type: 'alternating' },  // 45. +a,×m,÷n with growing add per cycle
  { fn: seqGens[46], type: 'alternating' },  // 46. +a₁,×b₁,+a₂,×b₂ varying pairs
];

/**
 * Returns generators filtered by series type.
 * Falls back to the full seqGens array when type is 'mixed' or unrecognised,
 * so that the difficulty filter in getSeqGens() always has something to work with.
 *
 * @param {string} type - One of 'mixed' | 'fibonacci' | 'exponential' | 'primes' | 'alternating' | 'sqrt-exp'
 * @returns {Function[]}
 */
export function getSeqGensByType(type) {
  if (!type || type === 'mixed') return seqGens;
  const filtered = seqGensMeta.filter(g => g.type === type).map(g => g.fn);
  // Guard: if the type yields nothing (e.g. an unknown value), return all generators
  return filtered.length > 0 ? filtered : seqGens;
}

// ── OOO generators ──
export const oooGens = [
  () => {
    const d = R(2, 7), s = R(1, 20), n = [];
    for (let i = 0; i < 5; i++) n.push(s + d * i);
    const oi = R(0, 4);
    n[oi] += R(1, 4) * (Math.random() > 0.5 ? 1 : -1);
    if (n[oi] === s + d * oi) n[oi]++;
    return { nums: n, oi, rule: `Series +${d} — <b>${n[oi]}</b> doesn't fit` };
  },
  () => {
    const n = [];
    for (let i = 0; i < 6; i++) n.push(R(1, 25) * 2);
    const oi = R(0, 5);
    n[oi] = R(1, 25) * 2 + 1;
    return { nums: n, oi, rule: `All even — <b>${n[oi]}</b> is odd` };
  },
  () => {
    const n = [];
    for (let i = 0; i < 6; i++) n.push(R(0, 24) * 2 + 1);
    const oi = R(0, 5);
    n[oi] = R(1, 25) * 2;
    return { nums: n, oi, rule: `All odd — <b>${n[oi]}</b> is even` };
  },
  () => {
    const P = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29];
    const n = shuf(P).slice(0, 5);
    const oi = R(0, 4);
    n[oi] = pick([4, 6, 8, 9, 10, 12, 14, 15]);
    return { nums: n, oi, rule: `Primes — <b>${n[oi]}</b> is not prime` };
  },
  () => {
    const b = R(3, 7), n = [];
    for (let i = 1; i <= 5; i++) n.push(b * i);
    const oi = R(0, 4);
    n[oi] += R(1, b - 1);
    return { nums: n, oi, rule: `Multiples of ${b} — <b>${n[oi]}</b> is not` };
  },
];

// ── Matrix generators ──
export const matGens = [
  () => {
    const t = R(12, 30), g = [];
    for (let r = 0; r < 3; r++) {
      const a = R(1, t - 3), b = R(1, t - a - 2), c = t - a - b;
      g.push([a, b, c]);
    }
    return { g, rule: `Each row = <b>${t}</b>` };
  },
  () => {
    const t = R(12, 30), g = [[], [], []];
    for (let c = 0; c < 3; c++) {
      const a = R(1, t - 3), b = R(1, t - a - 2), d = t - a - b;
      g[0][c] = a; g[1][c] = b; g[2][c] = d;
    }
    return { g, rule: `Each column = <b>${t}</b>` };
  },
  () => {
    const g = [];
    for (let r = 0; r < 3; r++) {
      const s = R(1, 10), d = R(2, 6);
      g.push([s, s + d, s + 2 * d]);
    }
    return { g, rule: 'Arithmetic series per row' };
  },
  () => {
    const g = [];
    for (let r = 0; r < 3; r++) {
      const a = R(2, 7), b = R(2, 7);
      g.push([a, b, a * b]);
    }
    return { g, rule: 'Row: Col1 × Col2 = Col3' };
  },
  () => {
    const g = [];
    for (let r = 0; r < 3; r++) {
      const a = R(2, 9), b = R(2, 9);
      g.push([a, b, a + b]);
    }
    return { g, rule: 'Row: Col1 + Col2 = Col3' };
  },
];
