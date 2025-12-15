using System;
using NUnit.Framework;
using MyProject.Domain.Entities;

namespace test;

public class TicketCreatedAtTests
{
    [Test]
    public void NewTicket_ShouldSetCreatedAt_CloseToUtcNow()
    {
       
        var before = DateTime.UtcNow;

       
        var ticket = new Ticket
        {
            Title = "Test",
            Description = "Opis",
            Priority = 2,
            CategoryId = 1,
            CreatedByUserId = "user@test"
        };

        var after = DateTime.UtcNow;

      
        Assert.That(ticket.CreatedAt, Is.InRange(before, after));
    }
}
