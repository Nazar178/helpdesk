using System.Reflection;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using MyProject.Application.Common.Interfaces;
using MyProject.Domain.Entities;
using MyProject.Infrastructure.Identity;

namespace MyProject.Infrastructure.Data;

public class ApplicationDbContext : IdentityDbContext<ApplicationUser>, IApplicationDbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }


    // ======= Nowe tablice SYSTEM ZGŁOSZEŃ =======
    public DbSet<Ticket> Tickets => Set<Ticket>();
    public DbSet<TicketCategory> TicketCategories => Set<TicketCategory>();
    public DbSet<TicketStatusHistory> TicketStatusHistories => Set<TicketStatusHistory>();
    public DbSet<AuditLog> AuditLogs => Set<AuditLog>();

    public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        return base.SaveChangesAsync(cancellationToken);
    }

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        
        builder.ApplyConfigurationsFromAssembly(Assembly.GetExecutingAssembly());

       
        // CREATE TRIGGER [trg_Tickets_StatusChange] ON [Tickets] ...
        builder.Entity<Ticket>()
            .ToTable(tb => tb.HasTrigger("trg_Tickets_StatusChange"));
    }
}
