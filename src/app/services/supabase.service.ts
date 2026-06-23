import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';

export interface Reunion {
  id: string;
  titulo: string;
  fecha: string;
  hora: string;
  meet_url: string;
  created_at: string;
  updated_at: string;
}

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(environment.supabaseUrl, environment.supabaseKey);
  }

  /**
   * Fetches the scheduled meeting for today (local date).
   * Queries: SELECT * FROM reuniones WHERE fecha = <today> ORDER BY hora ASC LIMIT 1;
   */
  async getMeetingForToday(): Promise<Reunion | null> {
    const today = this.getLocalYYYYMMDD();

    const { data, error } = await this.supabase
      .from('reuniones')
      .select('*')
      .eq('fecha', today)
      .order('hora', { ascending: true })
      .limit(1)
      .single();

    if (error) {
      // PGRST116 = "no rows found" which is a normal "no meeting today" case
      if (error.code === 'PGRST116') {
        return null;
      }
      console.error('Error fetching meeting:', error);
      throw error;
    }

    return data as Reunion;
  }

  private getLocalYYYYMMDD(): string {
    const tzoffset = (new Date()).getTimezoneOffset() * 60000;
    const localISOTime = (new Date(Date.now() - tzoffset)).toISOString().slice(0, 10);
    return localISOTime;
  }
}
