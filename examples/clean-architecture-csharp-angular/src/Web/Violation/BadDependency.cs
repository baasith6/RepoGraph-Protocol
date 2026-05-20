// INTENTIONAL VIOLATION: Web layer referencing Infrastructure
using CarRentalExample.Infrastructure.Persistence;

namespace CarRentalExample.Web.Violation;

public class BadDependency
{
    private readonly AppDbContext _db = new();
}
