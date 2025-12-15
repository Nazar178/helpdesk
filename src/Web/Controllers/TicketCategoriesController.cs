using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MyProject.Domain.Entities;
using MyProject.Infrastructure.Data;

namespace MyProject.Web.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TicketCategoriesController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public TicketCategoriesController(ApplicationDbContext context)
    {
        _context = context;
    }

   
    [HttpGet]
    public async Task<ActionResult<IEnumerable<TicketCategory>>> GetCategories()
    {
        var categories = await _context.TicketCategories
            .AsNoTracking()
            .ToListAsync();

        return Ok(categories);
    }
}
