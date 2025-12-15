using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NUnit.Framework;
using MyProject.Infrastructure.Data;
using MyProject.Web.Controllers;

namespace test;

public class TicketsControllerCreateTicketTests
{
    [Test]
    public async Task CreateTicket_ShouldPersistTicket_WithStatusNowe()
    {
       
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(databaseName: "CreateTicket_ShouldPersistTicket")
            .Options;

        await using var context = new ApplicationDbContext(options);

        var controller = new TicketsController(context);

        var request = new TicketsController.CreateTicketRequest
        {
            Title = "Test ticket",
            Description = "Opis zgłoszenia",
            Priority = 2,
            CategoryId = 1
        };

       
        var actionResult = await controller.CreateTicket(request);

      
        var okResult = actionResult.Result as OkObjectResult;
        Assert.That(okResult, Is.Not.Null);

        var id = (int)okResult!.Value!;

       
        var ticketInDb = await context.Tickets.SingleOrDefaultAsync(t => t.Id == id);

        Assert.That(ticketInDb, Is.Not.Null);
        Assert.That(ticketInDb!.Title, Is.EqualTo("Test ticket"));
        Assert.That(ticketInDb.Status, Is.EqualTo("Nowe"));
    }
}
