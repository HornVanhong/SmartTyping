'use client';

import React, { useState, useEffect } from 'react';
import { STARTER_PASSAGES } from '@/lib/typing/starter-passages';
import { Passage, Locale, Difficulty } from '@/lib/typing/types';
import { BookOpen, Sparkles, Filter, ArrowRight, CheckCircle, Search } from 'lucide-react';
import Link from 'next/link';
import { API_BASE } from '@/lib/config/api';

export default function PracticePage() {
  const [passages, setPassages] = useState<Passage[]>(STARTER_PASSAGES);
  const [localeFilter, setLocaleFilter] = useState<string>('all');
  const [diffFilter, setDiffFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    async function loadCatalog() {
      try {
        const res = await fetch(`${API_BASE}/passages?size=50`, {
          headers: { Accept: 'application/json' },
        });
        if (res.ok) {
          const data = await res.json();
          if (data.content && data.content.length > 0) {
            setPassages(data.content);
          }
        }
      } catch {
        // Fall back to STARTER_PASSAGES
      }
    }
    loadCatalog();
  }, []);

  const filteredPassages = passages.filter((p) => {
    if (localeFilter !== 'all' && p.locale !== localeFilter) return false;
    if (diffFilter !== 'all' && p.difficulty !== diffFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        (p.title && p.title.toLowerCase().includes(q)) ||
        p.content.toLowerCase().includes(q) ||
        (p.category && p.category.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div className="flex-1 max-w-6xl mx-auto px-4 py-8 sm:py-12 flex flex-col gap-8 w-full">
      {/* Header */}
      <div className="flex flex-col gap-2 max-w-2xl">
        <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent uppercase tracking-wider">
          <BookOpen className="w-4 h-4" />
          <span>Curated Practice Library</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground">
          Bilingual Reading &amp; Practice Catalog
        </h1>
        <p className="text-sm text-muted leading-relaxed">
          Explore sentences, paragraphs, and cultural passages across English and Khmer. Selected
          for fluency, vocabulary development, and Unicode keyboard practice.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 p-4 rounded-2xl bg-surface border border-border">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search passages by keyword, title, or topic..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-elevated border border-border text-foreground placeholder:text-muted/60 text-sm focus:outline-none focus:border-primary transition-colors"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Locale Filter */}
          <div className="flex items-center gap-1 bg-elevated p-1 rounded-xl border border-border text-xs font-medium">
            <button
              type="button"
              onClick={() => setLocaleFilter('all')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                localeFilter === 'all'
                  ? 'bg-primary text-background font-semibold'
                  : 'text-muted hover:text-foreground'
              }`}
            >
              All Languages
            </button>
            <button
              type="button"
              onClick={() => setLocaleFilter('en')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                localeFilter === 'en'
                  ? 'bg-primary text-background font-semibold'
                  : 'text-muted hover:text-foreground'
              }`}
            >
              English
            </button>
            <button
              type="button"
              onClick={() => setLocaleFilter('km')}
              className={`px-3 py-1.5 rounded-lg font-khmer transition-colors ${
                localeFilter === 'km'
                  ? 'bg-primary text-background font-semibold'
                  : 'text-muted hover:text-foreground'
              }`}
            >
              ភាសាខ្មែរ
            </button>
          </div>

          {/* Difficulty Filter */}
          <div className="flex items-center gap-1 bg-elevated p-1 rounded-xl border border-border text-xs font-medium">
            {['all', 'BEGINNER', 'INTERMEDIATE', 'ADVANCED'].map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setDiffFilter(d)}
                className={`px-2.5 py-1.5 rounded-lg transition-colors capitalize ${
                  diffFilter === d
                    ? 'bg-accent text-background font-semibold'
                    : 'text-muted hover:text-foreground'
                }`}
              >
                {d === 'all' ? 'All Levels' : d.toLowerCase()}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Passages Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredPassages.map((item) => (
          <div
            key={item.id}
            className="p-6 rounded-2xl bg-surface border border-border hover:border-primary/40 transition-all flex flex-col justify-between gap-4 group"
          >
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between gap-2">
                <span className="font-bold text-foreground text-base group-hover:text-primary transition-colors">
                  {item.title || 'Practice Text'}
                </span>

                <div className="flex items-center gap-1.5">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      item.locale === 'km'
                        ? 'bg-accent/20 text-accent border border-accent/30 font-khmer'
                        : 'bg-primary/20 text-primary border border-primary/30'
                    }`}
                  >
                    {item.locale.toUpperCase()}
                  </span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-elevated text-muted border border-border capitalize">
                    {item.difficulty.toLowerCase()}
                  </span>
                </div>
              </div>

              <p
                className={`text-sm text-muted/90 line-clamp-3 leading-relaxed ${
                  item.locale === 'km' ? 'font-khmer leading-loose text-base' : ''
                }`}
              >
                {item.content}
              </p>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-border/50 text-xs text-muted">
              <span className="capitalize">{item.category?.toLowerCase() || 'General'}</span>

              <Link
                href={`/?passage=${item.id}&locale=${item.locale}`}
                className="flex items-center gap-1.5 font-semibold text-primary group-hover:text-primary-light transition-colors"
              >
                <span>Type Passage</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </div>
        ))}
      </div>

      {filteredPassages.length === 0 && (
        <div className="py-16 text-center text-muted text-sm rounded-2xl bg-surface border border-border">
          No passages found matching your filter criteria. Try adjusting your search query.
        </div>
      )}
    </div>
  );
}
