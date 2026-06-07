package com.prestalink.api.dashboard;

import com.prestalink.api.category.CategoryRepository;
import com.prestalink.api.mission.MissionRepository;
import com.prestalink.api.mission.MissionStatus;
import com.prestalink.api.offer.OfferRepository;
import com.prestalink.api.publication.PublicationStatus;
import com.prestalink.api.request.RequestRepository;
import com.prestalink.api.user.UserRepository;
import com.prestalink.api.user.UserRole;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import com.prestalink.api.user.UserStatus;
@Service
@RequiredArgsConstructor
public class DashboardService {

    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final OfferRepository offerRepository;
    private final RequestRepository requestRepository;
    private final MissionRepository missionRepository;

    public DashboardResponse getDashboard() {

        return DashboardResponse.builder()

                .totalUsers(userRepository.count())

                .totalClients(userRepository.findByRole(UserRole.CLIENT).size())

                .totalProviders(userRepository.findByRole(UserRole.PRESTATAIRE).size())

                .availableProviders(
                        userRepository.countByRoleAndStatus(
                                UserRole.PRESTATAIRE,
                                UserStatus.DISPONIBLE
                        )
                )

                .busyProviders(
                        userRepository.countByRoleAndStatus(
                                UserRole.PRESTATAIRE,
                                UserStatus.EN_COURS_PRESTATION
                        )
                )

                .availableClients(
                        userRepository.countByRoleAndStatus(
                                UserRole.CLIENT,
                                UserStatus.DISPONIBLE
                        )
                )

                .busyClients(
                        userRepository.countByRoleAndStatus(
                                UserRole.CLIENT,
                                UserStatus.OCCUPE
                        )
                )

                .totalCategories(categoryRepository.count())

                .totalOffers(offerRepository.count())

                .activeOffers(offerRepository.findByActiveTrue().size())

                .totalRequests(requestRepository.count())

                .pendingRequests(
                        requestRepository.findByStatus(
                                PublicationStatus.AVAILABLE
                        ).size()
                )
                .cancelledRequests(
                        requestRepository.findByStatus(PublicationStatus.SUSPENDED).size()
                )

                .totalMissions(missionRepository.count())

                .activeMissions(
                        missionRepository.findByStatus(
                                MissionStatus.EN_COURS
                        ).size()
                )

                .finishedMissions(
                        missionRepository.findByStatus(
                                MissionStatus.TERMINEE
                        ).size()
                )
                .cancelledMissions(
                        missionRepository.findByStatus(
                                MissionStatus.ANNULEE
                        ).size()
                )

                .build();
    }
}

