using CarRentalExample.Application.Booking;
using Microsoft.AspNetCore.Mvc;

namespace CarRentalExample.Web.Booking;

[Route("api/bookings")]
[ApiController]
public class BookingController : ControllerBase
{
    [HttpPost]
    public IActionResult Create([FromBody] CreateBookingCommand command)
    {
        var booking = command.Execute();
        return Ok(booking);
    }
}
