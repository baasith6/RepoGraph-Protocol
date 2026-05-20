using CarRentalExample.Domain.Booking;

namespace CarRentalExample.Application.Booking;

public class CreateBookingCommand
{
    public Guid UserId { get; set; }
    public DateTime StartDate { get; set; }

    public BookingEntity Execute()
    {
        return new BookingEntity { Id = Guid.NewGuid(), UserId = UserId, StartDate = StartDate };
    }
}

public class BookingEntity : Booking { }
