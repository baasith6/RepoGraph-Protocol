using CarRentalExample.Domain.Auth;
using CarRentalExample.Domain.Booking;

namespace CarRentalExample.Infrastructure.Persistence;

public class AppDbContext
{
    public DbSet<Booking> Bookings { get; set; } = null!;
    public DbSet<User> Users { get; set; } = null!;
}

/// <summary>Marker for Roslyn DbSet detection without EF package reference.</summary>
public class DbSet<T>
{
}
