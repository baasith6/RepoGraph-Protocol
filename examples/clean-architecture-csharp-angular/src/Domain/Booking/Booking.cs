namespace CarRentalExample.Domain.Booking;

public class Booking
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public DateTime StartDate { get; set; }
}
