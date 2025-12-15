using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MyProject.Infrastructure.Data;
using MyProject.Infrastructure.Identity;

namespace MyProject.Web.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AccountController : ControllerBase
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly ApplicationDbContext _context;

    public AccountController(UserManager<ApplicationUser> userManager, ApplicationDbContext context)
    {
        _userManager = userManager;
        _context = context;
    }

   
    public class MeResponse
    {
        public bool IsAuthenticated { get; set; }
        public string? UserName { get; set; }
        public string? Email { get; set; }
        public IList<string> Roles { get; set; } = new List<string>();

    
        public int CreatedTicketsCount { get; set; }
        public int OpenTicketsCount { get; set; }
        public int ResolvedTicketsCount { get; set; }
        public int AssignedTicketsCount { get; set; }
    }

    [HttpGet("me")]
    public async Task<ActionResult<MeResponse>> Me()
    {
        
        if (User?.Identity == null || !User.Identity.IsAuthenticated)
        {
            return new MeResponse
            {
                IsAuthenticated = false
            };
        }

        var user = await _userManager.GetUserAsync(User);
        if (user == null)
        {
            return new MeResponse
            {
                IsAuthenticated = false
            };
        }

        var roles = await _userManager.GetRolesAsync(user);

        
        var userName = user.UserName ?? user.Email ?? User.Identity.Name ?? "";

        var createdTicketsCount = await _context.Tickets
            .CountAsync(t => t.CreatedByUserId == userName);

        
        var openTicketsCount = await _context.Tickets
            .CountAsync(t => t.CreatedByUserId == userName &&
                             (t.Status == "Nowe" || t.Status == "W realizacji"));

       
        var resolvedTicketsCount = await _context.Tickets
            .CountAsync(t => t.CreatedByUserId == userName &&
                             t.Status == "Rozwiązane");

        
        var assignedTicketsCount = await _context.Tickets
            .CountAsync(t => t.AssignedToUserId == userName);

        return new MeResponse
        {
            IsAuthenticated = true,
            UserName = userName,
            Email = user.Email,
            Roles = roles,
            CreatedTicketsCount = createdTicketsCount,
            OpenTicketsCount = openTicketsCount,
            ResolvedTicketsCount = resolvedTicketsCount,
            AssignedTicketsCount = assignedTicketsCount
        };
    }
}
