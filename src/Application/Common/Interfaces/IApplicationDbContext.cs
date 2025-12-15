using Microsoft.EntityFrameworkCore;
using MyProject.Domain.Entities;

namespace MyProject.Application.Common.Interfaces;

public interface IApplicationDbContext
{

   
    DbSet<Ticket> Tickets { get; }
    DbSet<TicketCategory> TicketCategories { get; }
    DbSet<TicketStatusHistory> TicketStatusHistories { get; }
    DbSet<AuditLog> AuditLogs { get; }

    Task<int> SaveChangesAsync(CancellationToken cancellationToken);
}
