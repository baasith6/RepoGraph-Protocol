using CarRentalExample.Domain.Auth;

namespace CarRentalExample.Application.Auth;

public class LoginCommand
{
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;

    public User Execute()
    {
        return new User { Id = Guid.NewGuid(), Email = Email };
    }
}
