using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NUnit.Framework;
using MyProject.Domain.Entities;
using MyProject.Infrastructure.Data;
using MyProject.Web.Controllers;

namespace test;

public class AdminTicketsControllerAcceptTests
{
    [Test]
    public async Task AcceptTicket_ShouldAssignAdmin_ChangeStatus_AndCreateHistory()
    {
       
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(databaseName: "AcceptTicket_ShouldCreateHistory")
            .Options;

        await using var context = new ApplicationDbContext(options);

        var ticket = new Ticket
        {
            Title = "Problem",
            Description = "Opis problemu",
            Priority = 2,
            CategoryId = 1,
            Status = "Nowe",
            CreatedByUserId = "user@test"
        };

        context.Tickets.Add(ticket);
        await context.SaveChangesAsync();

        var controller = new AdminTicketsController(context);

        
        var claims = new[]
        {
            new Claim(ClaimTypes.Name, "admin@local"),
            new Claim(ClaimTypes.Role, "Admin")
        };
        var identity = new ClaimsIdentity(claims, "TestAuth");
        var user = new ClaimsPrincipal(identity);

        controller.ControllerContext = new ControllerContext
        {
            HttpContext = new DefaultHttpContext
            {
                User = user
            }
        };

       
        var result = await controller.AcceptTicket(ticket.Id);

        
        Assert.That(result, Is.InstanceOf<NoContentResult>());

        var ticketInDb = await context.Tickets.SingleAsync(t => t.Id == ticket.Id);
        Assert.That(ticketInDb.AssignedToUserId, Is.EqualTo("admin@local"));
        Assert.That(ticketInDb.Status, Is.EqualTo("W realizacji"));

        var historyCount = await context.TicketStatusHistories.CountAsync(h => h.TicketId == ticket.Id);
        Assert.That(historyCount, Is.EqualTo(1));
    }
}
