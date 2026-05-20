import { Component } from '@angular/core';
import { BookingService } from './booking.service';

@Component({
  selector: 'app-booking',
  template: '<div>Booking</div>',
})
export class BookingComponent {
  constructor(private booking: BookingService) {}
}
