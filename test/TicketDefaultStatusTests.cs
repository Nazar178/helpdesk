using NUnit.Framework;
using MyProject.Domain.Entities;

namespace test;

public class TicketDefaultStatusTests
{
    [Test]
    public void NewTicket_ShouldHaveDefaultStatus_Nowe()
    {
       
        var ticket = new Ticket
        {
            Title = "Test",
            Description = "Opis",
            Priority = 2,
            CategoryId = 1,
            CreatedByUserId = "user@test"
        };

       
        Assert.That(ticket.Status, Is.EqualTo("Nowe"));
    }
}
