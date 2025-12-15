
using System.Net.Sockets;

namespace MyProject.Domain.Entities;

public class TicketCategory
{
    public int Id { get; set; }

    public string Name { get; set; } = default!;

    public string? Description { get; set; }

   
    public ICollection<Ticket> Tickets { get; set; } = new List<Ticket>();
}
