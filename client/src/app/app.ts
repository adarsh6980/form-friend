import { Component, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { DecimalPipe, TitleCasePipe } from '@angular/common';

interface Deadline { date: string | null; what: string }
interface Amount { value: string; what: string }
interface Classification {
  doc_type: string; sender: string; confidence: number; is_hard_case: boolean;
  _meta: { model: string; latencyMs: number }
}
interface Extracted {
  deadlines: Deadline[]; amounts: Amount[]; reference_numbers: string[];
  actions_required: string[]; recipient_must: string;
  _meta: { model: string; latencyMs: number }
}
interface TextStep { text: string; _meta: { model: string; latencyMs: number } }
interface RuleResult { title: string; url: string; snippet: string }
interface AnalyzeResult {
  classification: Classification; extracted: Extracted;
  summary: TextStep; reply: TextStep;
  current_rules?: { enabled: boolean; results: RuleResult[] };
  meta: { totalMs: number; tiering: Record<string, string> }
}

const API = 'http://localhost:8080';

@Component({
  selector: 'app-root',
  imports: [FormsModule, DecimalPipe, TitleCasePipe],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  private http = inject(HttpClient);

  letter = '';
  loading = signal(false);
  error = signal<string | null>(null);
  result = signal<AnalyzeResult | null>(null);

  samples = [
    { label: 'Revenue tax demand', file: '01-revenue-rf-notice' },
    { label: 'IRP renewal (Stamp 2)', file: '02-irp-renewal' },
    { label: 'Rent increase notice', file: '03-rent-increase' },
  ];

  loadSample(file: string) {
    this.error.set(null);
    this.http.get(`/samples/${file}.txt`, { responseType: 'text' })
      .subscribe({ next: (t) => (this.letter = t), error: () => this.error.set('Could not load the sample letter.') });
  }

  analyze() {
    if (this.letter.trim().length < 20) {
      this.error.set('Paste the full letter text first (at least a few lines).');
      return;
    }
    this.loading.set(true);
    this.error.set(null);
    this.result.set(null);
    this.http.post<AnalyzeResult>(`${API}/api/analyze`, { letter: this.letter })
      .subscribe({
        next: (r) => { this.result.set(r); this.loading.set(false); },
        error: (e) => { this.error.set(e?.error?.error || 'Analysis failed. Is the server running?'); this.loading.set(false); },
      });
  }

  shortModel(id: string): string {
    if (id.includes('ultra')) return 'Nemotron Ultra';
    if (id.includes('super')) return 'Nemotron Super';
    if (id.includes('nano')) return 'Nemotron Nano';
    return id;
  }
}
