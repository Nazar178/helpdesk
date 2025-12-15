using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MyProject.Domain.Entities;
using MyProject.Infrastructure.Data;

namespace MyProject.Web.Controllers;

[ApiController]
[Route("api/admin/tickets")]
[Authorize(Roles = "Admin")]
public class AdminTicketsController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public AdminTicketsController(ApplicationDbContext context)
    {
        _context = context;
    }

   

    public class AdminTicketDto
    {
        public int Id { get; set; }
        public string Title { get; set; } = default!;
        public string? CategoryName { get; set; }
        public int Priority { get; set; }
        public string Status { get; set; } = default!;
        public string? AdminComment { get; set; }
        public string CreatedBy { get; set; } = default!;
        public DateTime CreatedAt { get; set; }

        public string? AssignedToUserId { get; set; }
        public bool IsAccepted { get; set; }
    }

    public class UpdateTicketRequest
    {
        public string Status { get; set; } = default!;
        public string? AdminComment { get; set; }
    }



    [HttpGet]
    public async Task<ActionResult<IEnumerable<AdminTicketDto>>> GetTickets()
    {
        var tickets = await _context.Tickets
            .Include(t => t.Category)
            .OrderByDescending(t => t.CreatedAt)
            .Select(t => new AdminTicketDto
            {
                Id = t.Id,
                Title = t.Title,
                CategoryName = t.Category != null ? t.Category.Name : null,
                Priority = t.Priority,
                Status = t.Status,
                AdminComment = t.AdminComment,
                CreatedBy = t.CreatedByUserId,
                CreatedAt = t.CreatedAt,
                AssignedToUserId = t.AssignedToUserId,
                IsAccepted = t.AssignedToUserId != null
            })
            .AsNoTracking()
            .ToListAsync();

        return Ok(tickets);
    }

   

    [HttpPost("{id:int}/accept")]
    public async Task<IActionResult> AcceptTicket(int id)
    {
        var ticket = await _context.Tickets.FindAsync(id);
        if (ticket == null)
            return NotFound();

        if (ticket.AssignedToUserId != null)
            return BadRequest("Zgłoszenie zostało już przyjęte.");

        var adminId = User?.Identity?.Name ?? "system";
        var oldStatus = ticket.Status;

        ticket.AssignedToUserId = adminId;
        ticket.Status = "W realizacji";
        ticket.UpdatedAt = DateTime.UtcNow;

        var history = new TicketStatusHistory
        {
            TicketId = ticket.Id,
            OldStatus = oldStatus,
            NewStatus = ticket.Status,
            ChangedByUserId = adminId,
            ChangedAt = DateTime.UtcNow,
            Comment = "Przyjęcie zgłoszenia przez administratora."
        };

        _context.TicketStatusHistories.Add(history);

        await _context.SaveChangesAsync();

        return NoContent();
    }

    

    [HttpPut("{id:int}")]
    public async Task<IActionResult> UpdateTicket(int id, [FromBody] UpdateTicketRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var ticket = await _context.Tickets.FindAsync(id);
        if (ticket == null)
            return NotFound();

        var adminId = User?.Identity?.Name ?? "system";

        
        if (ticket.AssignedToUserId == null ||
            !string.Equals(ticket.AssignedToUserId, adminId, StringComparison.OrdinalIgnoreCase))
        {
            return Forbid();
        }

        var oldStatus = ticket.Status;

        ticket.Status = request.Status;
        ticket.AdminComment = request.AdminComment;
        ticket.UpdatedAt = DateTime.UtcNow;

        if (!string.Equals(oldStatus, ticket.Status, StringComparison.Ordinal))
        {
            var history = new TicketStatusHistory
            {
                TicketId = ticket.Id,
                OldStatus = oldStatus,
                NewStatus = ticket.Status,
                ChangedByUserId = adminId,
                ChangedAt = DateTime.UtcNow,
                Comment = request.AdminComment
            };

            _context.TicketStatusHistories.Add(history);
        }

        await _context.SaveChangesAsync();

        return NoContent();
    }

    
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> DeleteTicket(int id)
    {
        var ticket = await _context.Tickets.FindAsync(id);
        if (ticket == null)
            return NotFound();

        _context.Tickets.Remove(ticket);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}
