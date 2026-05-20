namespace CarRentalExample.Domain.Auth;

public class User
{
    public Guid TenantId { get; set; }
    public Guid Id { get; set; }
    public string Email { get; set; } = string.Empty;
}
