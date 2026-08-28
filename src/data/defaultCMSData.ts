import { CMSPageData } from '../types';

export const DEFAULT_CMS_PAGES: Record<string, CMSPageData> = {
  home: {
    id: 'home',
    title: 'Home Page',
    slug: '/',
    hero: {
      badge: 'Welcome to Bethesda',
      title: 'Bethesda Community Church',
      subtitle: 'A Sanctuary for the Soul & A Family for the Heart',
      description: "Bethesda Community Church (BCC) is more than a building—it's a sanctuary for the soul and a family for the heart in Kabankalan City.",
      imageUrl: 'https://images.unsplash.com/photo-1544427920-c49ccfb85579?auto=format&fit=crop&q=80&w=1920',
      primaryButton: {
        label: 'Our Story & Vision',
        url: '/about',
        visible: true,
        style: 'primary'
      },
      secondaryButton: {
        label: 'Watch Live',
        url: '/live',
        visible: true,
        style: 'secondary'
      },
      visible: true
    },
    sections: [
      {
        id: 'home-mission-quote',
        name: 'Pastor Quote & Welcome Statement',
        title: 'A sanctuary for the soul and a home for the heart.',
        subtitle: 'Our Pastoral Calling',
        content: 'Whether you are seeking God for the first time or looking for a church family to call home, our doors and our hearts are wide open for you.',
        badge: 'Message from Leadership',
        imageUrl: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&q=80&w=1200',
        quote: {
          text: 'We exist to equip disciples who make disciples, touching lives with the radical grace and unconditional love of Jesus Christ.',
          author: 'Pastor & Leadership Council'
        },
        primaryButton: {
          label: 'Learn About BCC',
          url: '/about',
          visible: true
        },
        visible: true,
        type: 'quote'
      },
      {
        id: 'home-feature-cards',
        name: 'Discover Community Highlights',
        title: 'Experience Life at Bethesda',
        subtitle: 'Find Your Next Step',
        content: 'From inspirational Sunday preaching to vibrant youth fellowship and community prayer, explore the life of our church.',
        badge: 'Church Life',
        cards: [
          {
            id: 'card-sermons',
            title: 'Sunday Sermons',
            description: 'Listen to Bible-centered messages and timeless spiritual nourishment.',
            imageUrl: 'https://images.unsplash.com/photo-1438232992991-995b7058bbb3?auto=format&fit=crop&q=80&w=800',
            iconName: 'Video',
            buttonLabel: 'Watch Messages',
            buttonUrl: '/sermons',
            buttonVisible: true
          },
          {
            id: 'card-ministries',
            title: 'Active Ministries',
            description: 'Connect with Young at Hearts, Youth, Sherpas, Circle of Women, and Kids.',
            imageUrl: 'https://images.unsplash.com/photo-1529070538774-1843cb3265df?auto=format&fit=crop&q=80&w=800',
            iconName: 'Users',
            buttonLabel: 'Explore Ministries',
            buttonUrl: '/ministries',
            buttonVisible: true
          },
          {
            id: 'card-activities',
            title: 'Weekly Fellowships',
            description: 'Join mid-week prayer meetings, small groups, and choir practices.',
            imageUrl: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&q=80&w=800',
            iconName: 'Calendar',
            buttonLabel: 'View Schedule',
            buttonUrl: '/activities',
            buttonVisible: true
          },
          {
            id: 'card-prayer',
            title: 'Prayer Wall',
            description: 'Share your prayer requests and let our pastoral team and family intercede for you.',
            imageUrl: 'https://images.unsplash.com/photo-1507692049790-de58290a4334?auto=format&fit=crop&q=80&w=800',
            iconName: 'Heart',
            buttonLabel: 'Submit Prayer',
            buttonUrl: '/prayer',
            buttonVisible: true
          }
        ],
        visible: true,
        type: 'cards'
      },
      {
        id: 'home-bottom-cta',
        name: 'Bottom Invitation Banner',
        title: 'Join Us This Sunday Morning',
        subtitle: 'In-Person Worship at 9:00 AM',
        content: 'Come as you are. Experience heartfelt worship, sound biblical preaching, and warm fellowship in Kabankalan City.',
        badge: 'Sunday Gathering',
        imageUrl: 'https://images.unsplash.com/photo-1519817650390-64a93db51149?auto=format&fit=crop&q=80&w=1920',
        primaryButton: {
          label: 'Plan Your Visit',
          url: '/contact',
          visible: true,
          style: 'amber'
        },
        secondaryButton: {
          label: 'Become a Member',
          url: '/membership',
          visible: true,
          style: 'outline'
        },
        visible: true,
        type: 'cta'
      }
    ]
  },

  about: {
    id: 'about',
    title: 'About Page',
    slug: '/about',
    hero: {
      badge: 'About Bethesda Community Church',
      title: 'Our Story & Vision',
      subtitle: 'Rooted in Christ, Reaching the Lost, Restoring the Soul',
      description: 'Bethesda Community Church (BCC) was founded in 2017 with a simple mission: to be a sanctuary for the soul and a home for the Bethesda Family in Kabankalan City.',
      imageUrl: 'https://images.unsplash.com/photo-1438232992991-995b7058bbb3?auto=format&fit=crop&q=80&w=1920',
      primaryButton: {
        label: 'Meet Our Leaders',
        url: '#leaders',
        visible: true,
        style: 'primary'
      },
      secondaryButton: {
        label: 'Church Ministries',
        url: '/ministries',
        visible: true,
        style: 'secondary'
      },
      visible: true
    },
    sections: [
      {
        id: 'about-mission-vision',
        name: 'Mission, Vision & Goal Statements',
        title: 'A community where everyone is seen, known, and loved.',
        subtitle: 'Our Foundational Pillars',
        content: 'At BCC, we believe that the church is not a building, but a people. We are a multi-generational community committed to following Jesus and making His love known in our city and beyond.',
        badge: 'Our Purpose',
        imageUrl: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&q=80&w=1200',
        cards: [
          {
            id: 'about-mission',
            title: 'Our Mission',
            description: 'Equipping disciples making disciples.',
            iconName: 'Target'
          },
          {
            id: 'about-vision',
            title: 'Our Vision',
            description: 'A dynamic, Spirit-filled Church, passionate about the lost; proactive and proficient in ministry skills numbering thousands upon thousands in kingdom building, impacting our city, nation and the world through leadership development, intentional discipleship, proclaiming and practicing the full importance and authenticity of the Word who are called to live in Christ, equipped to live like Christ, and sent to live for Christ.',
            iconName: 'Compass'
          },
          {
            id: 'about-goal',
            title: 'Our Goal',
            description: 'Raise up men and women who will love above all else the God who loves them above all else.',
            iconName: 'Award'
          }
        ],
        visible: true,
        type: 'story'
      },
      {
        id: 'about-core-values',
        name: 'Core Values Section',
        title: 'What We Stand For',
        subtitle: 'Our Guiding Principles',
        content: 'These core values guide everything we do as a church family, from our Sunday worship to our midweek community groups.',
        badge: 'Core Values',
        cards: [
          {
            id: 'val-christ',
            title: 'Christ-Centered',
            description: 'Jesus is the center of everything we do, from our worship to our community service.',
            iconName: 'Target'
          },
          {
            id: 'val-comm',
            title: 'Community Focused',
            description: 'We believe in doing life together, supporting one another through every season.',
            iconName: 'Users'
          },
          {
            id: 'val-truth',
            title: 'Biblical Truth',
            description: 'We are committed to the uncompromised teaching and living of God\'s Word.',
            iconName: 'Shield'
          },
          {
            id: 'val-grace',
            title: 'Grace & Love',
            description: 'We strive to reflect the radical love and grace that Christ has shown us.',
            iconName: 'Heart'
          }
        ],
        visible: true,
        type: 'values'
      }
    ]
  },

  membership: {
    id: 'membership',
    title: 'Membership & Covenant',
    slug: '/membership',
    hero: {
      badge: 'Church Membership',
      title: 'Becoming a Part of BCC',
      subtitle: 'A Family for the Heart & A Sanctuary for the Soul',
      description: 'Membership at Bethesda Community Church is not a club membership—it is a biblical commitment to love, serve, grow, and walk in unity with a local body of believers.',
      imageUrl: 'https://images.unsplash.com/photo-1529070538774-1843cb3265df?auto=format&fit=crop&q=80&w=1920',
      primaryButton: {
        label: 'Inquire for Class',
        url: '#inquiry-form',
        visible: true,
        style: 'primary'
      },
      secondaryButton: {
        label: 'Membership Steps',
        url: '#process',
        visible: true,
        style: 'secondary'
      },
      visible: true
    },
    sections: [
      {
        id: 'membership-covenant',
        name: 'The BCC Membership Covenant',
        title: 'Our Covenant of Fellowship',
        subtitle: 'Walking in Mutual Love and Accountability',
        content: 'We commit ourselves to God and to one another to protect the unity of our church, share in the responsibility of our family, and serve the ministry of our community.',
        badge: 'Mutual Commitment',
        cards: [
          {
            id: 'cov-protect',
            title: '1. Protecting Church Unity',
            description: 'By acting in love toward other members, refusing to gossip, and following church leadership.',
            iconName: 'Shield'
          },
          {
            id: 'cov-share',
            title: '2. Sharing Responsibility',
            description: 'By praying for its growth, warmly welcoming visitors, and faithfully attending.',
            iconName: 'Users'
          },
          {
            id: 'cov-serve',
            title: '3. Serving in Ministry',
            description: 'By discovering my spiritual gifts and developing a servant heart to bless others.',
            iconName: 'Heart'
          },
          {
            id: 'cov-testify',
            title: '4. Supporting Church Testimony',
            description: 'By living a godly life, giving regularly and cheerfully, and sharing the Gospel.',
            iconName: 'Sparkles'
          }
        ],
        visible: true,
        type: 'cards'
      },
      {
        id: 'membership-steps',
        name: '4-Step Membership Pathway',
        title: 'How to Become an Official Member',
        subtitle: 'Your Journey to Official Membership',
        content: 'We make the pathway clear, encouraging, and centered on spiritual discovery and pastoral connection.',
        badge: 'The Pathway',
        cards: [
          {
            id: 'step-1',
            title: 'Step 1: Regular Worship',
            subtitle: 'Get to know our community',
            description: 'Attend our Sunday worship services and connect with our members and pastors.',
            badge: '01'
          },
          {
            id: 'step-2',
            title: 'Step 2: Class 101',
            subtitle: 'Discover BCC Doctrines',
            description: 'Participate in our Membership Orientation Class covering our faith, vision, and governance.',
            badge: '02'
          },
          {
            id: 'step-3',
            title: 'Step 3: Pastoral Interview',
            subtitle: 'Personal prayer & conversation',
            description: 'A warm meeting with a Pastor or Elder to hear your testimony and answer any questions.',
            badge: '03'
          },
          {
            id: 'step-4',
            title: 'Step 4: Right Hand of Fellowship',
            subtitle: 'Welcome to the Family',
            description: 'Be officially welcomed before the congregation during a Sunday morning celebration!',
            badge: '04'
          }
        ],
        visible: true,
        type: 'schedule'
      }
    ]
  },

  give: {
    id: 'give',
    title: 'Giving & Stewardship',
    slug: '/give',
    hero: {
      badge: 'Worship Through Giving',
      title: 'Giving & Stewardship',
      subtitle: 'Honoring God with Our Firstfruits',
      description: '"Each of you should give what you have decided in your heart to give, not reluctantly or under compulsion, for God loves a cheerful giver." — 2 Corinthians 9:7',
      imageUrl: 'https://images.unsplash.com/photo-1544427920-c49ccfb85579?auto=format&fit=crop&q=80&w=1920',
      primaryButton: {
        label: 'Sunday Service Times',
        url: '#service-times',
        visible: true,
        style: 'primary'
      },
      secondaryButton: {
        label: 'Sanctuary Location',
        url: '/contact',
        visible: true,
        style: 'secondary'
      },
      visible: true
    },
    sections: [
      {
        id: 'give-notice-box',
        name: 'In-Person Giving Notice',
        title: 'Join Us in Person to Give Your Offering',
        subtitle: 'Notice: In-Person Stewardship',
        content: 'Online donations and electronic transfers are currently unavailable. We warmly encourage church members, visitors, and friends to give their tithes, offerings, and gifts in person when you visit Bethesda Community Church for our Sunday Worship Services.',
        badge: 'In-Person Giving',
        visible: true,
        type: 'info'
      },
      {
        id: 'give-service-times',
        name: 'Sunday Worship Service Details',
        title: 'Sunday Service Times & Location',
        subtitle: 'Bethesda Sanctuary in Kabankalan City',
        content: 'Experience uplifting worship, fervent prayer, and biblical preaching every Sunday at 9:00 AM.',
        badge: 'Sanctuary Worship',
        primaryButton: {
          label: 'Get Directions to BCC',
          url: '/contact',
          visible: true
        },
        visible: true,
        type: 'schedule'
      },
      {
        id: 'give-biblical-cards',
        name: 'Why We Practice Biblical Giving',
        title: 'The Heart of Biblical Giving',
        subtitle: 'Understanding Christian Stewardship',
        content: 'Giving is an act of worship, trust, and grateful obedience to God who has provided all things for us.',
        badge: 'Biblical Principles',
        cards: [
          {
            id: 'give-honor',
            title: '1. Honoring God First',
            description: 'Proverbs 3:9 teaches us to honor the Lord with our wealth and with the firstfruits of all our produce.',
            iconName: 'Sparkles'
          },
          {
            id: 'give-advance',
            title: '2. Advancing Kingdom Work',
            description: 'Your offerings sustain preaching, youth outreach, pastoral care, and local community assistance.',
            iconName: 'Heart'
          },
          {
            id: 'give-blessing',
            title: '3. Joyful Obedience',
            description: 'God loves a cheerful giver whose heart is grounded in gratitude for Christ’s boundless generosity.',
            iconName: 'Shield'
          }
        ],
        visible: true,
        type: 'cards'
      }
    ]
  },

  contact: {
    id: 'contact',
    title: 'Contact Us',
    slug: '/contact',
    hero: {
      badge: 'We’d Love to Connect',
      title: 'Contact & Location',
      subtitle: 'Visit Our Sanctuary or Send a Message',
      description: 'Have questions, need prayer, or looking for directions to our church? Our pastoral staff and ministry team are eager to welcome you.',
      imageUrl: 'https://images.unsplash.com/photo-1548625361-195fe5795df5?auto=format&fit=crop&q=80&w=1920',
      primaryButton: {
        label: 'Send a Message',
        url: '#contact-form',
        visible: true,
        style: 'primary'
      },
      secondaryButton: {
        label: 'View Map',
        url: '#map-section',
        visible: true,
        style: 'secondary'
      },
      visible: true
    },
    sections: [
      {
        id: 'contact-info-cards',
        name: 'Church Contact Information Cards',
        title: 'Where to Find Us',
        subtitle: 'Sanctuary & Schedule Details',
        content: 'Bethesda Community Church is located in Kabankalan City, Negros Occidental. We are open for prayer, fellowship, and services.',
        badge: 'Information',
        cards: [
          {
            id: 'ci-address',
            title: 'Sanctuary Address',
            description: 'Bethesda Community Church, Kabankalan City, Negros Occidental, Philippines',
            iconName: 'MapPin'
          },
          {
            id: 'ci-times',
            title: 'Service Hours',
            description: 'Sunday Morning Worship: 9:00 AM • Wednesday Prayer: 6:00 PM',
            iconName: 'Clock'
          },
          {
            id: 'ci-phone',
            title: 'Phone & Inquiries',
            description: 'Call or text us for pastoral visits, counseling, or event schedules.',
            iconName: 'Phone'
          },
          {
            id: 'ci-email',
            title: 'Official Email',
            description: 'contact@bethesdacity.church',
            iconName: 'Mail'
          }
        ],
        visible: true,
        type: 'contact'
      }
    ]
  },

  ministries: {
    id: 'ministries',
    title: 'Ministries & Fellowships',
    slug: '/ministries',
    hero: {
      badge: 'Growing in Fellowship',
      title: 'Ministries & Fellowships',
      subtitle: 'Finding Your Community & Calling',
      description: 'At BCC, our ministries are designed to nurture every generation—from energetic kids and passionate youths to courageous husbands, women of faith, and seasoned seniors.',
      imageUrl: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&q=80&w=1920',
      primaryButton: {
        label: 'Explore All Ministries',
        url: '#ministry-grid',
        visible: true,
        style: 'primary'
      },
      secondaryButton: {
        label: 'Weekly Activities',
        url: '/activities',
        visible: true,
        style: 'secondary'
      },
      visible: true
    },
    sections: [
      {
        id: 'ministries-intro',
        name: 'Ministry Purpose Banner',
        title: 'A Place to Belong, Serve, and Flourish',
        subtitle: 'Equipped to Live Like Christ',
        content: 'Every ministry provides an intimate atmosphere to study God’s Word, build authentic friendships, and serve the wider community through God-given gifts.',
        badge: 'Life in Community',
        imageUrl: 'https://images.unsplash.com/photo-1529070538774-1843cb3265df?auto=format&fit=crop&q=80&w=1200',
        visible: true,
        type: 'banner'
      }
    ]
  },

  live: {
    id: 'live',
    title: 'Live Stream & Online Broadcast',
    slug: '/live',
    hero: {
      badge: 'Watch Online',
      title: 'Live Worship Broadcast',
      subtitle: 'Worship with the Bethesda Family from Anywhere',
      description: 'Tune into our live video broadcasts every Sunday at 9:00 AM. Experience the praise, prayer, and life-transforming Word of God wherever you are.',
      imageUrl: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&q=80&w=1920',
      primaryButton: {
        label: 'Watch Sunday Service',
        url: '#video-player',
        visible: true,
        style: 'amber'
      },
      secondaryButton: {
        label: 'Past Sermons Archive',
        url: '/sermons',
        visible: true,
        style: 'outline'
      },
      visible: true
    },
    sections: [
      {
        id: 'live-broadcast-info',
        name: 'Broadcast Schedule and Guidance',
        title: 'Broadcast Schedule & Online Fellowship',
        subtitle: 'Connecting Hearts Across Distance',
        content: 'Our live stream starts every Sunday at 9:00 AM Philippine Standard Time (PST). Have your Bible, notebook, and heart ready to worship together.',
        badge: 'Streaming Info',
        cards: [
          {
            id: 'live-time',
            title: 'Sunday Morning Live',
            subtitle: '9:00 AM PST',
            description: 'Full Sunday morning service with live worship music and sermon.',
            iconName: 'Clock'
          },
          {
            id: 'live-facebook',
            title: 'Facebook Live & YouTube',
            subtitle: 'Interactive Chat',
            description: 'Participate in prayer comments, greetings, and live fellowship in the chat.',
            iconName: 'Video'
          },
          {
            id: 'live-archive',
            title: 'On-Demand Sermons',
            subtitle: 'Missed a service?',
            description: 'All sermon recordings are archived and accessible anytime in our Sermon library.',
            iconName: 'BookOpen'
          }
        ],
        visible: true,
        type: 'cards'
      }
    ]
  },

  resources: {
    id: 'resources',
    title: 'Church Resources',
    slug: '/resources',
    hero: {
      badge: 'Equipping the Saints',
      title: 'Church Resources & Downloads',
      subtitle: 'Study Guides, Bulletins, Forms & Ministry Materials',
      description: 'Access downloadable resources, sermon notes, discipleship guides, and church forms curated for our members and visitors.',
      imageUrl: 'https://images.unsplash.com/photo-1507692049790-de58290a4334?auto=format&fit=crop&q=80&w=1920',
      primaryButton: {
        label: 'Browse Documents',
        url: '#resources-list',
        visible: true,
        style: 'primary'
      },
      secondaryButton: {
        label: 'Church Sermons',
        url: '/sermons',
        visible: true,
        style: 'secondary'
      },
      visible: true
    },
    sections: [
      {
        id: 'resources-banner',
        name: 'Discipleship Material Highlight',
        title: 'Growing in the Knowledge of Christ',
        subtitle: 'Tools for Daily Spiritual Growth',
        content: 'We provide materials to assist you in personal devotions, family Bible time, and small group leadership.',
        badge: 'Spiritual Tools',
        visible: true,
        type: 'banner'
      }
    ]
  },

  events: {
    id: 'events',
    title: 'Events Page',
    slug: '/events',
    hero: {
      badge: 'Calendar of Events',
      title: 'Church Events & Gatherings',
      subtitle: 'Join Us for Special Fellowships and Community Outreaches',
      description: 'Discover upcoming seminars, youth camps, marriage workshops, praise nights, and special outreach programs at Bethesda.',
      imageUrl: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&q=80&w=1920',
      primaryButton: {
        label: 'View Upcoming Events',
        url: '#events-list',
        visible: true,
        style: 'primary'
      },
      secondaryButton: {
        label: 'Weekly Activities',
        url: '/activities',
        visible: true,
        style: 'secondary'
      },
      visible: true
    },
    sections: []
  },

  sermons: {
    id: 'sermons',
    title: 'Sermons Library',
    slug: '/sermons',
    hero: {
      badge: 'Preaching God’s Word',
      title: 'Sermons & Messages',
      subtitle: 'Biblical Preaching for Every Season of Life',
      description: 'Explore the archive of Sunday messages and special series preached at Bethesda Community Church.',
      imageUrl: 'https://images.unsplash.com/photo-1438232992991-995b7058bbb3?auto=format&fit=crop&q=80&w=1920',
      primaryButton: {
        label: 'Browse Messages',
        url: '#sermons-list',
        visible: true,
        style: 'primary'
      },
      secondaryButton: {
        label: 'Watch Live Stream',
        url: '/live',
        visible: true,
        style: 'secondary'
      },
      visible: true
    },
    sections: []
  },

  gallery: {
    id: 'gallery',
    title: 'Photo Gallery',
    slug: '/gallery',
    hero: {
      badge: 'Memories & Celebrations',
      title: 'Church Photo Gallery',
      subtitle: 'Snapshots of Faith, Worship, and Family',
      description: 'Glimpse through the moments, fellowship retreats, baptism services, and joyous gatherings of our church family.',
      imageUrl: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&q=80&w=1920',
      primaryButton: {
        label: 'View Photo Albums',
        url: '#albums',
        visible: true,
        style: 'primary'
      },
      visible: true
    },
    sections: []
  },

  activities: {
    id: 'activities',
    title: 'Weekly Activities',
    slug: '/activities',
    hero: {
      badge: 'Weekly Schedule',
      title: 'Weekly Fellowships & Activities',
      subtitle: 'Connecting Through the Week',
      description: 'Engage in prayer gatherings, youth huddles, music practices, and discipleship groups scheduled throughout the week.',
      imageUrl: 'https://images.unsplash.com/photo-1529070538774-1843cb3265df?auto=format&fit=crop&q=80&w=1920',
      primaryButton: {
        label: 'View Schedule',
        url: '#activities-list',
        visible: true,
        style: 'primary'
      },
      visible: true
    },
    sections: []
  },

  prayer: {
    id: 'prayer',
    title: 'Prayer Wall',
    slug: '/prayer',
    hero: {
      badge: 'Intercession & Grace',
      title: 'Prayer Wall & Requests',
      subtitle: 'Standing Together in Faith and Prayer',
      description: '"Do not be anxious about anything, but in every situation, by prayer and petition, with thanksgiving, present your requests to God." — Philippians 4:6',
      imageUrl: 'https://images.unsplash.com/photo-1507692049790-de58290a4334?auto=format&fit=crop&q=80&w=1920',
      primaryButton: {
        label: 'Submit Prayer Request',
        url: '#prayer-form',
        visible: true,
        style: 'primary'
      },
      visible: true
    },
    sections: []
  },

  blogs: {
    id: 'blogs',
    title: 'Church Blogs & Articles',
    slug: '/blogs',
    hero: {
      badge: 'Pastoral Reflections',
      title: 'Articles & Reflections',
      subtitle: 'Spiritual Insights and Pastoral Notes',
      description: 'Read thought-provoking reflections, theological insights, and inspiring testimonies written by our church leaders and members.',
      imageUrl: 'https://images.unsplash.com/photo-1544427920-c49ccfb85579?auto=format&fit=crop&q=80&w=1920',
      primaryButton: {
        label: 'Read Latest Posts',
        url: '#posts-list',
        visible: true,
        style: 'primary'
      },
      visible: true
    },
    sections: []
  },

  footer: {
    id: 'footer',
    title: 'Global Footer',
    slug: 'footer',
    hero: {
      title: 'Bethesda Community Church',
      description: 'A sanctuary for the soul and a family for the heart in Kabankalan City, Negros Occidental.',
      imageUrl: '',
      visible: true
    },
    sections: [
      {
        id: 'footer-service-times',
        name: 'Footer Service Times',
        title: 'Sunday Worship Service',
        content: '9:00 AM • Sanctuary Worship & Preaching',
        visible: true
      },
      {
        id: 'footer-copyright',
        name: 'Copyright & Slogan',
        title: '© 2026 Bethesda Community Church (BCC). All rights reserved.',
        subtitle: 'Equipping Disciples Making Disciples.',
        visible: true
      }
    ]
  }
};
