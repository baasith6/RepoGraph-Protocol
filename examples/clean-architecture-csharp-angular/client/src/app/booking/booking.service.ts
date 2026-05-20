import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class BookingService {
  constructor(private http: HttpClient) {}

  createBooking(data: unknown) {
    return this.http.post('/api/bookings', data);
  }
}
