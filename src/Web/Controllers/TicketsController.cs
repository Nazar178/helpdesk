using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MyProject.Infrastructure.Data;
using MyProject.Domain.Entities;

namespace MyProject.Web.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TicketsController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public TicketsController(ApplicationDbContext context)
    {
        _context = context;
    }

    public class TicketDto
    {
        public int Id { get; set; }
        public string Title { get; set; } = default!;
        public string Description { get; set; } = default!;
        public int Priority { get; set; }
        public string Status { get; set; } = default!;
        public string? CategoryName { get; set; }
        public DateTime CreatedAt { get; set; }

        
        public string? AdminComment { get; set; }
    }

   
    public class StatusHistoryItemDto
    {
        public string? OldStatus { get; set; }
        public string NewStatus { get; set; } = default!;
        public DateTime ChangedAt { get; set; }
        public string ChangedBy { get; set; } = default!;
        public string? Comment { get; set; }
    }

    
    public class TicketDetailsDto
    {
        public int Id { get; set; }
        public string Title { get; set; } = default!;
        public string Description { get; set; } = default!;
        public int Priority { get; set; }
        public string Status { get; set; } = default!;
        public string? CategoryName { get; set; }
        public DateTime CreatedAt { get; set; }
        public string CreatedBy { get; set; } = default!;

        public string? AdminComment { get; set; }

        public List<StatusHistoryItemDto> History { get; set; } = new();
    }

    public class CreateTicketRequest
    {
        public string Title { get; set; } = default!;
        public string Description { get; set; } = default!;
        
        public int Priority { get; set; } = 2;
        public int CategoryId { get; set; }
    }

    public class CategoryDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = default!;
    }

    
    [HttpGet]
    public async Task<ActionResult<IEnumerable<TicketDto>>> GetTickets()
    {
        var tickets = await _context.Tickets
            .Include(t => t.Category)
            .OrderByDescending(t => t.CreatedAt)
            .Select(t => new TicketDto
            {
                Id = t.Id,
                Title = t.Title,
                Description = t.Description,
                Priority = t.Priority,
                Status = t.Status,
                CategoryName = t.Category != null ? t.Category.Name : null,
                CreatedAt = t.CreatedAt,
                AdminComment = t.AdminComment
            })
            .ToListAsync();

        return Ok(tickets);
    }

    
    [HttpGet("{id}")]
    public async Task<ActionResult<TicketDetailsDto>> GetTicket(int id)
    {
        var ticket = await _context.Tickets
            .Include(t => t.Category)
            .Include(t => t.StatusHistory)
            .FirstOrDefaultAsync(t => t.Id == id);

        if (ticket == null)
        {
            return NotFound();
        }

        var dto = new TicketDetailsDto
        {
            Id = ticket.Id,
            Title = ticket.Title,
            Description = ticket.Description,
            Priority = ticket.Priority,
            Status = ticket.Status,
            CategoryName = ticket.Category?.Name,
            CreatedAt = ticket.CreatedAt,
            CreatedBy = ticket.CreatedByUserId,
            AdminComment = ticket.AdminComment,
            History = ticket.StatusHistory
                .OrderBy(h => h.ChangedAt)
                .Select(h => new StatusHistoryItemDto
                {
                    OldStatus = h.OldStatus,
                    NewStatus = h.NewStatus,
                    ChangedAt = h.ChangedAt,
                    ChangedBy = h.ChangedByUserId,
                    Comment = h.Comment
                })
                .ToList()
        };

        return Ok(dto);
    }

    
    [HttpGet("categories")]
    public async Task<ActionResult<IEnumerable<CategoryDto>>> GetCategories()
    {
        var categories = await _context.TicketCategories
            .OrderBy(c => c.Name)
            .Select(c => new CategoryDto
            {
                Id = c.Id,
                Name = c.Name
            })
            .ToListAsync();

        return Ok(categories);
    }

    
    [HttpPost]
    [Authorize]
    public async Task<ActionResult<int>> CreateTicket([FromBody] CreateTicketRequest request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var userId = User?.Identity?.Name ?? "demo-user";

        var ticket = new Ticket
        {
            Title = request.Title,
            Description = request.Description,
            Priority = request.Priority,
            CategoryId = request.CategoryId,
            Status = "Nowe",
            CreatedByUserId = userId,
            CreatedAt = DateTime.UtcNow
        };

        _context.Tickets.Add(ticket);
        await _context.SaveChangesAsync();

        var log = new AuditLog
        {
            UserName = userId,
            Action = "CREATE",
            EntityName = "Ticket",
            EntityId = ticket.Id,
            CreatedAt = DateTime.UtcNow
        };

        _context.AuditLogs.Add(log);
        await _context.SaveChangesAsync();

        return Ok(ticket.Id);
    }
}
