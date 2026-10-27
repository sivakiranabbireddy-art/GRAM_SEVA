require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { User, Worker, Booking, Category, Feedback, Notification, Otp } = require('../models');

async function reseedSampleData() {
  try {
    console.log('[Seed] Connecting to MongoDB Atlas...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('[Seed] Connected. Clearing existing demo collections...');

    await User.deleteMany({});
    await Worker.deleteMany({});
    await Booking.deleteMany({});
    await Category.deleteMany({});
    await Feedback.deleteMany({});
    await Notification.deleteMany({});
    await Otp.deleteMany({});

    console.log('[Seed] Generating bcrypt hashes...');
    const defaultPassHash = await bcrypt.hash('123456', 10);

    const categories = [
      {
        id: "cat_electrical",
        name: "Electrical Services",
        icon: "Zap",
        description: "Home wiring, switches, lights, fans and circuit breakers.",
        basePriceEstimate: 299,
        isActive: true,
        createdAt: new Date("2026-09-05T08:30:00Z"),
        updatedAt: new Date("2026-10-13T08:30:00Z")
      },
      {
        id: "cat_plumbing",
        name: "Plumbing",
        icon: "Wrench",
        description: "Tap repair, pipe leaks, drainage and bathroom fittings.",
        basePriceEstimate: 249,
        isActive: true,
        createdAt: new Date("2026-09-05T08:30:00Z"),
        updatedAt: new Date("2026-10-13T08:30:00Z")
      },
      {
        id: "cat_cleaning",
        name: "Home Cleaning",
        icon: "Sparkles",
        description: "Room, kitchen and bathroom cleaning services.",
        basePriceEstimate: 399,
        isActive: true,
        createdAt: new Date("2026-09-05T08:30:00Z"),
        updatedAt: new Date("2026-10-13T08:30:00Z")
      },
      {
        id: "cat_appliance",
        name: "Appliance Repair",
        icon: "Hammer",
        description: "Basic diagnosis and repair of common household appliances.",
        basePriceEstimate: 349,
        isActive: true,
        createdAt: new Date("2026-09-05T08:30:00Z"),
        updatedAt: new Date("2026-10-13T08:30:00Z")
      },
      {
        id: "cat_carpentry",
        name: "Carpentry",
        icon: "House",
        description: "Door, hinge, shelf and basic furniture repairs.",
        basePriceEstimate: 299,
        isActive: false,
        createdAt: new Date("2026-09-05T08:30:00Z"),
        updatedAt: new Date("2026-10-13T08:30:00Z")
      }
    ];
    await Category.insertMany(categories);
    console.log(`[Seed] Inserted ${categories.length} categories.`);

    const users = [
      {
        id: "usr_admin_01",
        role: "ADMIN",
        name: "Admin Demo",
        email: "admin.demo@gramseva.test",
        phone: "+919000000001",
        passwordHash: defaultPassHash,
        address: "GramSeva Administration Office",
        locality: "Bhimavaram",
        pincode: "534202",
        isVerified: true,
        isActive: true,
        createdAt: new Date("2026-09-15T08:30:00Z"),
        updatedAt: new Date("2026-10-15T08:30:00Z")
      },
      {
        id: "usr_admin_02",
        role: "ADMIN",
        name: "Teja Valluri",
        email: "valluriteja5@gmail.com",
        phone: "+91 98765 43210",
        passwordHash: defaultPassHash,
        address: "GramSeva Administration Office",
        locality: "Bhimavaram",
        pincode: "534202",
        isVerified: true,
        isActive: true,
        createdAt: new Date("2026-09-15T08:30:00Z"),
        updatedAt: new Date("2026-10-15T08:30:00Z")
      },
      {
        id: "usr_cust_01",
        role: "CUSTOMER",
        name: "Ramesh Kumar",
        email: "ramesh.demo@gramseva.test",
        phone: "+919000000002",
        passwordHash: defaultPassHash,
        address: "House 12, Main Road",
        locality: "Bhimavaram",
        pincode: "534202",
        isVerified: true,
        isActive: true,
        createdAt: new Date("2026-09-25T08:30:00Z"),
        updatedAt: new Date("2026-10-14T08:30:00Z")
      },
      {
        id: "usr_cust_02",
        role: "CUSTOMER",
        name: "Lakshmi Devi",
        email: "lakshmi.demo@gramseva.test",
        phone: "+919000000003",
        passwordHash: defaultPassHash,
        address: "House 8, Temple Street",
        locality: "Undi",
        pincode: "534199",
        isVerified: true,
        isActive: true,
        createdAt: new Date("2026-10-03T08:30:00Z"),
        updatedAt: new Date("2026-10-13T08:30:00Z")
      },
      {
        id: "usr_work_01",
        role: "WORKER",
        name: "Suresh Patil",
        email: "suresh.demo@gramseva.test",
        phone: "+919000000004",
        passwordHash: defaultPassHash,
        address: "2nd Lane, Shanti Nagar",
        locality: "Bhimavaram",
        pincode: "534202",
        isVerified: true,
        isActive: true,
        createdAt: new Date("2026-08-16T08:30:00Z"),
        updatedAt: new Date("2026-10-14T08:30:00Z")
      },
      {
        id: "usr_work_02",
        role: "WORKER",
        name: "Ravi Naidu",
        email: "ravi.demo@gramseva.test",
        phone: "+919000000005",
        passwordHash: defaultPassHash,
        address: "Market Road",
        locality: "Undi",
        pincode: "534199",
        isVerified: true,
        isActive: true,
        createdAt: new Date("2026-08-31T08:30:00Z"),
        updatedAt: new Date("2026-10-14T08:30:00Z")
      },
      {
        id: "usr_work_03",
        role: "WORKER",
        name: "Mohan Rao",
        email: "mohan.demo@gramseva.test",
        phone: "+919000000006",
        passwordHash: defaultPassHash,
        address: "Near Bus Stand",
        locality: "Bhimavaram",
        pincode: "534202",
        isVerified: false,
        isActive: true,
        createdAt: new Date("2026-10-12T08:30:00Z"),
        updatedAt: new Date("2026-10-14T08:30:00Z")
      }
    ];
    await User.insertMany(users);
    console.log(`[Seed] Inserted ${users.length} users.`);

    const workers = [
      {
        id: "usr_work_01",
        skills: [
          "Electrical Services",
          "House Wiring",
          "Ceiling Fan Repair",
          "Motor Starter Fixing"
        ],
        experienceYears: 6,
        serviceArea: "Bhimavaram",
        pincode: "534202",
        description: "Residential electrician for wiring, fans and circuit-breaker issues.",
        isAvailable: true,
        status: "APPROVED",
        averageRating: 4.8,
        totalRatings: 12,
        totalCompletedBookings: 18,
        earningsTotal: 7200,
        createdAt: new Date("2026-08-16T08:30:00Z"),
        updatedAt: new Date("2026-10-14T08:30:00Z")
      },
      {
        id: "usr_work_02",
        skills: [
          "Plumbing",
          "Tap Repair",
          "Pipe Leakage",
          "Bathroom Fittings"
        ],
        experienceYears: 4,
        serviceArea: "Undi",
        pincode: "534199",
        description: "Plumber for household leaks, taps and sanitary fittings.",
        isAvailable: true,
        status: "APPROVED",
        averageRating: 4.5,
        totalRatings: 8,
        totalCompletedBookings: 11,
        earningsTotal: 4950,
        createdAt: new Date("2026-08-31T08:30:00Z"),
        updatedAt: new Date("2026-10-14T08:30:00Z")
      },
      {
        id: "usr_work_03",
        skills: [
          "Appliance Repair",
          "Mixer Repair",
          "Basic Electrical"
        ],
        experienceYears: 2,
        serviceArea: "Bhimavaram",
        pincode: "534202",
        description: "New worker profile awaiting administrator verification.",
        isAvailable: true,
        status: "PENDING_APPROVAL",
        averageRating: 5.0,
        totalRatings: 0,
        totalCompletedBookings: 0,
        earningsTotal: 0,
        createdAt: new Date("2026-10-12T08:30:00Z"),
        updatedAt: new Date("2026-10-14T08:30:00Z")
      }
    ];
    await Worker.insertMany(workers);
    console.log(`[Seed] Inserted ${workers.length} worker profiles.`);

    const bookings = [
      {
        id: "bk_demo_1001",
        customerId: "usr_cust_01",
        customerName: "Ramesh Kumar",
        customerPhone: "+919000000002",
        customerAddress: "House 12, Main Road",
        locality: "Bhimavaram",
        pincode: "534202",
        categoryId: "cat_electrical",
        categoryName: "Electrical Services",
        description: "Ceiling fan is making noise and rotating slowly.",
        preferredDate: "2026-10-16",
        preferredTimeSlot: "Morning (09:00 AM - 12:00 PM)",
        priceEstimate: 299,
        status: "WORKER_ASSIGNED",
        assignedWorkerId: "usr_work_01",
        assignedWorkerName: "Suresh Patil",
        assignedWorkerPhone: "+919000000004",
        cancelReason: null,
        rejectionReason: null,
        lastRejectedWorkerId: null,
        completionNote: null,
        completionTime: null,
        disputeReason: null,
        disputeCreatedAt: null,
        disputeResolution: null,
        timeline: [
          {
            status: "REQUESTED",
            timestamp: "2026-10-15T03:30:00Z",
            note: "Service request submitted",
            by: "Ramesh Kumar"
          },
          {
            status: "WORKER_ASSIGNED",
            timestamp: "2026-10-15T03:42:00Z",
            note: "Matched with Suresh Patil based on skill and locality",
            by: "System Matching Engine"
          }
        ],
        createdAt: new Date("2026-10-15T03:30:00Z"),
        updatedAt: new Date("2026-10-15T03:42:00Z")
      },
      {
        id: "bk_demo_1002",
        customerId: "usr_cust_02",
        customerName: "Lakshmi Devi",
        customerPhone: "+919000000003",
        customerAddress: "House 8, Temple Street",
        locality: "Undi",
        pincode: "534199",
        categoryId: "cat_plumbing",
        categoryName: "Plumbing",
        description: "Kitchen tap is leaking continuously.",
        preferredDate: "2026-10-16",
        preferredTimeSlot: "Afternoon (12:00 PM - 03:00 PM)",
        priceEstimate: 249,
        status: "ACCEPTED",
        assignedWorkerId: "usr_work_02",
        assignedWorkerName: "Ravi Naidu",
        assignedWorkerPhone: "+919000000005",
        cancelReason: null,
        rejectionReason: null,
        lastRejectedWorkerId: null,
        completionNote: null,
        completionTime: null,
        disputeReason: null,
        disputeCreatedAt: null,
        disputeResolution: null,
        timeline: [
          {
            status: "REQUESTED",
            timestamp: "2026-10-15T00:30:00Z",
            note: "Service request submitted",
            by: "Lakshmi Devi"
          },
          {
            status: "WORKER_ASSIGNED",
            timestamp: "2026-10-15T00:42:00Z",
            note: "Worker assigned",
            by: "System Matching Engine"
          },
          {
            status: "ACCEPTED",
            timestamp: "2026-10-15T00:54:00Z",
            note: "Worker accepted the booking",
            by: "Ravi Naidu"
          }
        ],
        createdAt: new Date("2026-10-15T00:30:00Z"),
        updatedAt: new Date("2026-10-15T00:54:00Z")
      },
      {
        id: "bk_demo_1003",
        customerId: "usr_cust_01",
        customerName: "Ramesh Kumar",
        customerPhone: "+919000000002",
        customerAddress: "House 12, Main Road",
        locality: "Bhimavaram",
        pincode: "534202",
        categoryId: "cat_appliance",
        categoryName: "Appliance Repair",
        description: "Mixer grinder is not starting; please inspect the power connection.",
        preferredDate: "2026-10-14",
        preferredTimeSlot: "Morning (09:00 AM - 12:00 PM)",
        priceEstimate: 349,
        status: "COMPLETED",
        assignedWorkerId: "usr_work_03",
        assignedWorkerName: "Mohan Rao",
        assignedWorkerPhone: "+919000000006",
        cancelReason: null,
        rejectionReason: null,
        lastRejectedWorkerId: null,
        completionNote: "Power cable connection was repaired and appliance tested.",
        completionTime: "2026-10-14T08:30:00Z",
        disputeReason: null,
        disputeCreatedAt: null,
        disputeResolution: null,
        timeline: [
          {
            status: "REQUESTED",
            timestamp: "2026-10-13T08:30:00Z",
            note: "Service request submitted",
            by: "Ramesh Kumar"
          },
          {
            status: "WORKER_ASSIGNED",
            timestamp: "2026-10-13T08:42:00Z",
            note: "Worker assigned",
            by: "Admin Demo"
          },
          {
            status: "ACCEPTED",
            timestamp: "2026-10-13T08:54:00Z",
            note: "Worker accepted",
            by: "Mohan Rao"
          },
          {
            status: "IN_PROGRESS",
            timestamp: "2026-10-13T09:06:00Z",
            note: "Repair started",
            by: "Mohan Rao"
          },
          {
            status: "AWAITING_CONFIRMATION",
            timestamp: "2026-10-13T09:18:00Z",
            note: "Customer confirmed completion",
            by: "Ramesh Kumar"
          },
          {
            status: "COMPLETED",
            timestamp: "2026-10-13T09:30:00Z",
            note: "Booking completed",
            by: "Ramesh Kumar"
          }
        ],
        createdAt: new Date("2026-10-13T08:30:00Z"),
        updatedAt: new Date("2026-10-14T08:30:00Z")
      },
      {
        id: "bk_demo_1004",
        customerId: "usr_cust_02",
        customerName: "Lakshmi Devi",
        customerPhone: "+919000000003",
        customerAddress: "House 8, Temple Street",
        locality: "Undi",
        pincode: "534199",
        categoryId: "cat_plumbing",
        categoryName: "Plumbing",
        description: "Bathroom pipe joint has a small leak.",
        preferredDate: "2026-10-13",
        preferredTimeSlot: "Evening (04:00 PM - 07:00 PM)",
        priceEstimate: 299,
        status: "CANCELLED",
        assignedWorkerId: null,
        assignedWorkerName: null,
        assignedWorkerPhone: null,
        cancelReason: "Customer rescheduled the repair.",
        rejectionReason: null,
        lastRejectedWorkerId: null,
        completionNote: null,
        completionTime: null,
        disputeReason: null,
        disputeCreatedAt: null,
        disputeResolution: null,
        timeline: [
          {
            status: "REQUESTED",
            timestamp: "2026-10-12T08:30:00Z",
            note: "Service request submitted",
            by: "Lakshmi Devi"
          },
          {
            status: "CANCELLED",
            timestamp: "2026-10-12T08:42:00Z",
            note: "Cancelled because customer needs a different date",
            by: "Lakshmi Devi"
          }
        ],
        createdAt: new Date("2026-10-12T08:30:00Z"),
        updatedAt: new Date("2026-10-12T08:42:00Z")
      },
      {
        id: "bk_demo_1005",
        customerId: "usr_cust_01",
        customerName: "Ramesh Kumar",
        customerPhone: "+919000000002",
        customerAddress: "House 12, Main Road",
        locality: "Bhimavaram",
        pincode: "534202",
        categoryId: "cat_electrical",
        categoryName: "Electrical Services",
        description: "One wall socket becomes hot during use; please inspect safely.",
        preferredDate: "2026-10-17",
        preferredTimeSlot: "Morning (09:00 AM - 12:00 PM)",
        priceEstimate: 399,
        status: "DISPUTED",
        assignedWorkerId: "usr_work_01",
        assignedWorkerName: "Suresh Patil",
        assignedWorkerPhone: "+919000000004",
        cancelReason: null,
        rejectionReason: null,
        lastRejectedWorkerId: null,
        completionNote: "Socket replaced; customer reports issue remains.",
        completionTime: "2026-10-13T08:30:00Z",
        disputeReason: "Customer says the socket still becomes hot after the repair.",
        disputeCreatedAt: "2026-10-14T08:30:00Z",
        disputeResolution: null,
        timeline: [
          {
            status: "REQUESTED",
            timestamp: "2026-10-11T08:30:00Z",
            note: "Service request submitted",
            by: "Ramesh Kumar"
          },
          {
            status: "WORKER_ASSIGNED",
            timestamp: "2026-10-11T08:42:00Z",
            note: "Worker assigned",
            by: "System Matching Engine"
          },
          {
            status: "ACCEPTED",
            timestamp: "2026-10-11T08:54:00Z",
            note: "Worker accepted",
            by: "Suresh Patil"
          },
          {
            status: "IN_PROGRESS",
            timestamp: "2026-10-11T09:06:00Z",
            note: "Inspection started",
            by: "Suresh Patil"
          },
          {
            status: "AWAITING_CONFIRMATION",
            timestamp: "2026-10-11T09:18:00Z",
            note: "Customer raised a concern",
            by: "Ramesh Kumar"
          },
          {
            status: "DISPUTED",
            timestamp: "2026-10-11T09:30:00Z",
            note: "Dispute sent to admin for review",
            by: "Ramesh Kumar"
          }
        ],
        createdAt: new Date("2026-10-11T08:30:00Z"),
        updatedAt: new Date("2026-10-14T08:30:00Z")
      },
      {
        id: "bk_demo_1006",
        customerId: "usr_cust_02",
        customerName: "Lakshmi Devi",
        customerPhone: "+919000000003",
        customerAddress: "House 8, Temple Street",
        locality: "Undi",
        pincode: "534199",
        categoryId: "cat_cleaning",
        categoryName: "Home Cleaning",
        description: "Need kitchen and bathroom deep cleaning.",
        preferredDate: "2026-10-18",
        preferredTimeSlot: "Afternoon (12:00 PM - 03:00 PM)",
        priceEstimate: 499,
        status: "REQUESTED",
        assignedWorkerId: null,
        assignedWorkerName: null,
        assignedWorkerPhone: null,
        cancelReason: null,
        rejectionReason: null,
        lastRejectedWorkerId: null,
        completionNote: null,
        completionTime: null,
        disputeReason: null,
        disputeCreatedAt: null,
        disputeResolution: null,
        timeline: [
          {
            status: "REQUESTED",
            timestamp: "2026-10-15T08:00:00Z",
            note: "Service request submitted; awaiting worker assignment",
            by: "Lakshmi Devi"
          }
        ],
        createdAt: new Date("2026-10-15T08:00:00Z"),
        updatedAt: new Date("2026-10-15T08:00:00Z")
      }
    ];
    await Booking.insertMany(bookings);
    console.log(`[Seed] Inserted ${bookings.length} bookings.`);

    const feedbacks = [
      {
        id: "fb_demo_2001",
        bookingId: "bk_demo_1003",
        customerId: "usr_cust_01",
        customerName: "Ramesh Kumar",
        workerId: "usr_work_03",
        workerName: "Mohan Rao",
        categoryName: "Appliance Repair",
        rating: 5,
        review: "Friendly service and the mixer was tested before leaving.",
        tags: [
          "Polite",
          "Quick Service",
          "Good Work"
        ],
        resolutionStatus: "RESOLVED",
        createdAt: new Date("2026-10-14T08:30:00Z"),
        updatedAt: new Date("2026-10-14T08:30:00Z")
      }
    ];
    await Feedback.insertMany(feedbacks);
    console.log(`[Seed] Inserted ${feedbacks.length} feedbacks.`);

    const notifications = [
      {
        id: "notif_demo_3001",
        userId: "usr_cust_01",
        role: "CUSTOMER",
        title: "Worker assigned",
        message: "Suresh Patil has been assigned to your ceiling fan repair request.",
        link: "/customer/bookings",
        metadata: {
          bookingId: "bk_demo_1001"
        },
        isRead: false,
        createdAt: new Date("2026-10-15T04:30:00Z"),
        updatedAt: new Date("2026-10-15T04:30:00Z")
      },
      {
        id: "notif_demo_3002",
        userId: "usr_work_02",
        role: "WORKER",
        title: "New booking assigned",
        message: "A plumbing request in Undi is waiting for your service.",
        link: "/worker/bookings",
        metadata: {
          bookingId: "bk_demo_1002"
        },
        isRead: true,
        createdAt: new Date("2026-10-15T01:30:00Z"),
        updatedAt: new Date("2026-10-15T02:30:00Z")
      },
      {
        id: "notif_demo_3003",
        userId: "usr_admin_01",
        role: "ADMIN",
        title: "Worker approval pending",
        message: "Mohan Rao has registered and is waiting for verification.",
        link: "/admin/workers",
        metadata: {
          workerId: "usr_work_03"
        },
        isRead: false,
        createdAt: new Date("2026-10-13T08:30:00Z"),
        updatedAt: new Date("2026-10-13T08:30:00Z")
      },
      {
        id: "notif_demo_3004",
        userId: "usr_admin_01",
        role: "ADMIN",
        title: "Booking dispute requires review",
        message: "A customer reported that the socket issue remains unresolved.",
        link: "/admin/bookings",
        metadata: {
          bookingId: "bk_demo_1005"
        },
        isRead: false,
        createdAt: new Date("2026-10-14T08:30:00Z"),
        updatedAt: new Date("2026-10-14T08:30:00Z")
      },
      {
        id: "notif_demo_3005",
        userId: "usr_cust_02",
        role: "CUSTOMER",
        title: "Booking completed",
        message: "Your mixer repair booking has been marked completed.",
        link: "/customer/bookings",
        metadata: {
          bookingId: "bk_demo_1003"
        },
        isRead: true,
        createdAt: new Date("2026-10-14T08:30:00Z"),
        updatedAt: new Date("2026-10-14T08:30:00Z")
      },
      {
        id: "notif_demo_3006",
        userId: null,
        role: "ALL",
        title: "Welcome to GramSeva",
        message: "Find trusted local workers for common household services.",
        link: "/",
        metadata: {},
        isRead: false,
        createdAt: new Date("2026-10-05T08:30:00Z"),
        updatedAt: new Date("2026-10-05T08:30:00Z")
      }
    ];
    await Notification.insertMany(notifications);
    console.log(`[Seed] Inserted ${notifications.length} notifications.`);

    console.log('[Seed] ✅ Successfully re-seeded MongoDB Atlas with provided dataset!');
    await mongoose.disconnect();
  } catch (err) {
    console.error('[Seed] Error reseeding sample data:', err);
    process.exit(1);
  }
}

reseedSampleData();
