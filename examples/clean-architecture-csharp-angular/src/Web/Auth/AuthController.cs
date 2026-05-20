using CarRentalExample.Application.Auth;
using Microsoft.AspNetCore.Mvc;

namespace CarRentalExample.Web.Auth;

[Route("api/auth")]
[ApiController]
public class AuthController : ControllerBase
{
    [HttpPost("login")]
    public IActionResult Login([FromBody] LoginCommand command)
    {
        var user = command.Execute();
        return Ok(user);
    }
}
