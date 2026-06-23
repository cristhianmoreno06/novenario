import { Component, OnInit, signal } from '@angular/core';
import { SupabaseService, Reunion } from '../services/supabase.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: []
})
export class HomePage implements OnInit {
  meeting = signal<Reunion | null>(null);
  loading = signal<boolean>(true);
  error = signal<string | null>(null);
  joining = signal<boolean>(false);

  constructor(private supabaseService: SupabaseService) {}

  ngOnInit() {
    this.fetchTodayMeeting();
  }

  async fetchTodayMeeting() {
    this.loading.set(true);
    this.error.set(null);
    try {
      const data = await this.supabaseService.getMeetingForToday();
      this.meeting.set(data);
    } catch (err: any) {
      console.error(err);
      this.error.set('No se pudo conectar a la base de datos.');
    } finally {
      this.loading.set(false);
    }
  }

  joinMeeting() {
    const activeMeeting = this.meeting();
    if (!activeMeeting || !activeMeeting.meet_url) return;

    this.joining.set(true);

    if (window.navigator.vibrate) {
      window.navigator.vibrate(10);
    }

    setTimeout(() => {
      window.open(activeMeeting.meet_url, '_blank');
      this.joining.set(false);
    }, 1500);
  }

  // Format YYYY-MM-DD to "Lunes 15 de Septiembre"
  formatDateInSpanish(dateStr: string): string {
    if (!dateStr) return '';
    const [year, month, day] = dateStr.split('-').map(Number);
    const date = new Date(Date.UTC(year, month - 1, day));
    const options: Intl.DateTimeFormatOptions = { weekday: 'long', day: 'numeric', month: 'long' };
    const formatted = new Intl.DateTimeFormat('es-ES', options).format(date);
    return formatted.charAt(0).toUpperCase() + formatted.slice(1);
  }

  // Format 18:00:00 to "6:00 PM"
  formatTime12h(timeStr: string): string {
    if (!timeStr) return '';
    const parts = timeStr.split(':');
    let hour = parseInt(parts[0], 10);
    const minutes = parts[1];
    const ampm = hour >= 12 ? 'PM' : 'AM';
    hour = hour % 12;
    hour = hour ? hour : 12; // hour '0' should be '12'
    return `${hour}:${minutes} ${ampm}`;
  }

  // Parse novena day number from title (e.g. "Primer día de novenario" -> 1)
  getNovenaDay(title: string): number {
    if (!title) return 1;
    const t = title.toLowerCase();
    if (t.includes('primer') || t.includes('1')) return 1;
    if (t.includes('segundo') || t.includes('2')) return 2;
    if (t.includes('tercer') || t.includes('3')) return 3;
    if (t.includes('cuarto') || t.includes('4')) return 4;
    if (t.includes('quinto') || t.includes('5')) return 5;
    if (t.includes('sexto') || t.includes('6')) return 6;
    if (t.includes('septimo') || t.includes('séptimo') || t.includes('7')) return 7;
    if (t.includes('octavo') || t.includes('8')) return 8;
    if (t.includes('noveno') || t.includes('9')) return 9;
    return 1;
  }
}
